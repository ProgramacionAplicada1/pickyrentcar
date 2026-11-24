-- ============================================================================
-- PickyRentCar — 022_payment_flow.sql
-- ============================================================================
-- Nuevo flujo de reserva y pago:
--
--   pendiente ──(admin acepta)──► pendiente_pago  [aparta fechas 48 h]
--        │                           │  cliente reporta pago (pago 'pendiente'
--        │                           │  con referencia/comprobante, o efectivo)
--        │                           ▼
--        │                     "en revisión" (pendiente_pago + pago pendiente,
--        │                      no vence mientras el admin revisa)
--        │                           │ admin confirma ─► confirmada (pagada)
--        │                           │ admin rechaza  ─► pago 'fallido' + motivo,
--        │                           │                   vuelve a pendiente_pago
--        │                           │                   con 48 h nuevas
--        │                     vencida sin pago ─► cancelada (perezoso)
--        ▼
--   confirmada ──(admin entrega)──► activa (en curso) ──► finalizada
--
-- Cambios de BD:
--   1. reservations.payment_due_at  (plazo para pagar)
--   2. pagos.comprobante_path, pagos.motivo_rechazo
--   3. profiles: datos bancarios del dueño de flota (multi-tenant)
--   4. Disponibilidad: bloquean confirmada/activa y pendiente_pago vigente o
--      en revisión. EXCLUDE para impedir doble alquiler.
--   5. RPCs: cancel_expired_reservations(), get_payment_details(uuid)
--   6. Bucket privado `comprobantes` + policies.
--
-- Requiere: 018 (estado pendiente_pago), btree_gist (ya instalado).
-- Idempotente.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1-3. Columnas nuevas
-- ----------------------------------------------------------------------------
alter table public.reservations
  add column if not exists payment_due_at timestamptz;

alter table public.pagos
  add column if not exists comprobante_path text,
  add column if not exists motivo_rechazo text;

alter table public.profiles
  add column if not exists banco text,
  add column if not exists tipo_cuenta text,
  add column if not exists numero_cuenta text,
  add column if not exists titular_cuenta text;

-- El usuario solo puede editar estas columnas de su perfil (ver 012).
grant update (full_name, phone, avatar_url, banco, tipo_cuenta, numero_cuenta, titular_cuenta)
  on public.profiles to authenticated;

-- Reservas aceptadas antes de este flujo: 48 h desde ahora para pagar.
update public.reservations
   set payment_due_at = now() + interval '48 hours'
 where status = 'pendiente_pago'
   and payment_due_at is null;

create index if not exists reservations_payment_due_idx
  on public.reservations (payment_due_at)
  where status = 'pendiente_pago';

-- ----------------------------------------------------------------------------
-- 4. Disponibilidad
-- ----------------------------------------------------------------------------

-- ¿La reserva aparta fechas en este momento?
create or replace function public.reservation_blocks_dates(
  p_status text,
  p_payment_due_at timestamptz,
  p_reservation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    p_status in ('confirmada', 'activa')
    or (
      p_status = 'pendiente_pago'
      and (
        p_payment_due_at is null
        or p_payment_due_at > now()
        or exists (
          select 1 from public.pagos pg
          where pg.reservation_id = p_reservation_id
            and pg.estado = 'pendiente'
        )
      )
    );
$$;

revoke all on function public.reservation_blocks_dates(text, timestamptz, uuid) from public, anon, authenticated;

create or replace function public.check_vehicle_availability(
  p_vehicle_id uuid,
  p_start_date date,
  p_end_date date
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1
    from public.reservations r
    where r.vehicle_id = p_vehicle_id
      and r.start_date <= p_end_date
      and r.end_date >= p_start_date
      and public.reservation_blocks_dates(r.status, r.payment_due_at, r.id)
  );
$$;

grant execute on function public.check_vehicle_availability(uuid, date, date) to anon, authenticated;

create or replace function public.get_reserved_ranges_for_vehicle(p_vehicle_id uuid)
returns table (start_date date, end_date date)
language sql
stable
security definer
set search_path = ''
as $$
  select r.start_date, r.end_date
  from public.reservations r
  where r.vehicle_id = p_vehicle_id
    and public.reservation_blocks_dates(r.status, r.payment_due_at, r.id);
$$;

grant execute on function public.get_reserved_ranges_for_vehicle(uuid) to anon, authenticated;

-- Vence (cancela) reservas por pagar cuyo plazo pasó y que no tienen un pago
-- en revisión. La app lo llama antes de listar/transicionar reservas.
create or replace function public.cancel_expired_reservations()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  n int;
begin
  update public.reservations r
     set status = 'cancelada'
   where r.status = 'pendiente_pago'
     and r.payment_due_at is not null
     and r.payment_due_at < now()
     and not exists (
       select 1 from public.pagos pg
       where pg.reservation_id = r.id and pg.estado = 'pendiente'
     );
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.cancel_expired_reservations() from public, anon;
grant execute on function public.cancel_expired_reservations() to authenticated;

-- Doble alquiler imposible a nivel BD: dos reservas que apartan fechas no
-- pueden solaparse para el mismo vehículo. (Las pendiente_pago vencidas se
-- cancelan con cancel_expired_reservations antes de cada transición.)
-- Si ya hubiera solapamientos en los datos, NO se crea y se avisa.
do $$
begin
  if not exists (select 1 from pg_constraint
                 where conname = 'reservations_no_overlap'
                   and conrelid = 'public.reservations'::regclass) then
    begin
      alter table public.reservations
        add constraint reservations_no_overlap
        exclude using gist (
          vehicle_id with =,
          daterange(start_date, end_date, '[]') with &&
        )
        where (status in ('pendiente_pago', 'confirmada', 'activa'));
    exception when exclusion_violation then
      raise notice 'reservations_no_overlap NO creado: hay reservas solapadas en pendiente_pago/confirmada/activa. Resuélvelas y vuelve a ejecutar esta migración.';
    end;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 5. Datos de pago del dueño para el cliente de una reserva
-- ----------------------------------------------------------------------------
create or replace function public.get_payment_details(p_reservation_id uuid)
returns table (
  banco text,
  tipo_cuenta text,
  numero_cuenta text,
  titular_cuenta text
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.banco, p.tipo_cuenta, p.numero_cuenta, p.titular_cuenta
  from public.reservations r
  join public.vehicles v on v.id = r.vehicle_id
  join public.profiles p on p.id = v.created_by
  where r.id = p_reservation_id
    and (r.client_id = (select auth.uid()) or v.created_by = (select auth.uid()));
$$;

revoke all on function public.get_payment_details(uuid) from public, anon;
grant execute on function public.get_payment_details(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 6. Comprobantes de pago (bucket privado)
--    Ruta: {cliente_id}/{reservation_id}/{archivo}
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', false)
on conflict (id) do nothing;

drop policy if exists "Clients upload own payment proofs" on storage.objects;
create policy "Clients upload own payment proofs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'comprobantes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Clients and owners read payment proofs" on storage.objects;
create policy "Clients and owners read payment proofs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'comprobantes'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (
        select 1
        from public.reservations r
        join public.vehicles v on v.id = r.vehicle_id
        where r.id::text = (storage.foldername(name))[2]
          and v.created_by = (select auth.uid())
      )
    )
  );

drop policy if exists "Clients delete own payment proofs" on storage.objects;
create policy "Clients delete own payment proofs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'comprobantes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

commit;

-- ============================================================================
-- Fin de 022_payment_flow.sql
-- ============================================================================
