-- ============================================================================
-- PickyRentCar — 019_security_hardening.sql
-- ============================================================================
-- Alinea la BD de producción con lo que la app espera y cierra huecos de
-- seguridad detectados al comparar la BD real (export 2026-11-23) con las
-- migraciones del repo.
--
--   1. Reservas: se eliminan policies creadas a mano ("Admins can update
--      reservations", "ver reservas"); el INSERT público solo admite
--      status = 'pendiente' y el precio lo calcula la BD (trigger).
--   2. Pagos: el cliente solo puede registrar pagos 'pendiente'; solo el
--      dueño del vehículo puede cambiar/borrar pagos. Se añaden los CHECK,
--      índices, trigger updated_at y FK que la 007 definía pero no existen.
--   3. Vehículos: anon ya no lee la tabla directamente (el catálogo usa
--      los RPCs SECURITY DEFINER de 004/013). Trigger updated_at.
--   4. Funciones: se corrige cleanup_orphan_vehicle_images (comparaba con
--      una URL que nunca coincide → borraba todo), se eliminan
--      debug_auth_context, is_admin y get_current_role (no usadas), y se
--      restringe EXECUTE de las funciones SECURITY DEFINER internas.
--
-- Idempotente: se puede ejecutar más de una vez.
-- Requiere que la app use el cálculo de días = end_date - start_date
-- (services/catalog.ts#createPublicReservation, ya actualizado).
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. RESERVATIONS
-- ----------------------------------------------------------------------------

-- 1.1 Policies creadas a mano que rompen el aislamiento entre dueños.
--     - "Admins can update reservations": cualquier cuenta admin (el registro
--       en /register es público) podía modificar reservas de otros dueños.
--       Los dueños ya tienen "Vehicle owners can update reservations".
--     - "ver reservas": permitía leer reservas de invitado de otra persona
--       por coincidencia de email. La app filtra por client_id.
drop policy if exists "Admins can update reservations" on public.reservations;
drop policy if exists "ver reservas" on public.reservations;

-- 1.2 INSERT público: solo reservas nuevas en estado 'pendiente'.
drop policy if exists "Anyone can create reservation" on public.reservations;
create policy "Anyone can create reservation"
  on public.reservations for insert
  to anon, authenticated
  with check (
    status = 'pendiente'
    and (
      ((select auth.uid()) is null and client_id is null)
      or (
        (select auth.uid()) is not null
        and (client_id is null or client_id = (select auth.uid()))
      )
    )
  );

-- 1.3 Precio calculado en la BD: ignora days/daily_price/total_price que
--     mande el cliente y los recalcula desde el vehículo.
--     days = noches entre inicio y fin (mismo cálculo que la app).
create or replace function public.reservations_enforce_pricing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_price numeric(10,2);
begin
  select v.daily_price
    into v_price
    from public.vehicles v
   where v.id = new.vehicle_id;

  if v_price is null then
    raise exception 'El vehículo % no existe', new.vehicle_id
      using errcode = 'foreign_key_violation';
  end if;

  new.days        := new.end_date - new.start_date;
  new.daily_price := v_price;
  new.total_price := new.days * v_price;
  return new;
end;
$$;

revoke all on function public.reservations_enforce_pricing() from public, anon, authenticated;

drop trigger if exists reservations_enforce_pricing on public.reservations;
create trigger reservations_enforce_pricing
  before insert on public.reservations
  for each row execute function public.reservations_enforce_pricing();

-- 1.4 Índice de la migración 010 que no existe en producción
--     (lo usan "Mis reservas" y la policy "Clients can read own reservations").
create index if not exists reservations_client_id_idx
  on public.reservations (client_id);

-- ----------------------------------------------------------------------------
-- 2. PAGOS
-- ----------------------------------------------------------------------------

-- 2.1 Policies: lectura igual que en 016; escritura restringida.
drop policy if exists "pagos_select_policy" on public.pagos;
drop policy if exists "pagos_insert_policy" on public.pagos;
drop policy if exists "pagos_update_policy" on public.pagos;
drop policy if exists "pagos_delete_policy" on public.pagos;

-- Dueño del vehículo o cliente de la reserva.
create policy "pagos_select_policy"
  on public.pagos for select
  to authenticated
  using ( (select public.user_owns_reservation(reservation_id)) );

-- Dueño del vehículo: cualquier estado. Cliente: solo 'pendiente'
-- (reporta una transferencia; el admin la confirma).
create policy "pagos_insert_policy"
  on public.pagos for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and (select public.user_owns_reservation(reservation_id))
    and (
      estado = 'pendiente'
      or exists (
        select 1
        from public.reservations r
        join public.vehicles v on v.id = r.vehicle_id
        where r.id = pagos.reservation_id
          and v.created_by = (select auth.uid())
      )
    )
  );

-- Solo el dueño del vehículo cambia el estado de un pago.
create policy "pagos_update_policy"
  on public.pagos for update
  to authenticated
  using (
    exists (
      select 1
      from public.reservations r
      join public.vehicles v on v.id = r.vehicle_id
      where r.id = pagos.reservation_id
        and v.created_by = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.reservations r
      join public.vehicles v on v.id = r.vehicle_id
      where r.id = pagos.reservation_id
        and v.created_by = (select auth.uid())
    )
  );

create policy "pagos_delete_policy"
  on public.pagos for delete
  to authenticated
  using (
    exists (
      select 1
      from public.reservations r
      join public.vehicles v on v.id = r.vehicle_id
      where r.id = pagos.reservation_id
        and v.created_by = (select auth.uid())
    )
  );

-- 2.2 CHECK de la 007 que no existen en producción.
--     Se crean NOT VALID (se aplican a filas nuevas de inmediato) y luego se
--     intenta validar las existentes; si hay datos viejos inválidos, la
--     migración NO falla: deja un NOTICE para revisarlos.
do $$
begin
  if not exists (select 1 from pg_constraint
                 where conname = 'pagos_monto_positive'
                   and conrelid = 'public.pagos'::regclass) then
    alter table public.pagos
      add constraint pagos_monto_positive check (monto > 0) not valid;
  end if;

  if not exists (select 1 from pg_constraint
                 where conname = 'pagos_metodo_pago_check'
                   and conrelid = 'public.pagos'::regclass) then
    alter table public.pagos
      add constraint pagos_metodo_pago_check
      check (metodo_pago in ('Tarjeta', 'Efectivo', 'Transferencia')) not valid;
  end if;

  if not exists (select 1 from pg_constraint
                 where conname = 'pagos_estado_check'
                   and conrelid = 'public.pagos'::regclass) then
    alter table public.pagos
      add constraint pagos_estado_check
      check (estado in ('pendiente', 'completado', 'fallido', 'reembolsado')) not valid;
  end if;
end $$;

do $$
declare
  c text;
begin
  foreach c in array array['pagos_monto_positive', 'pagos_metodo_pago_check', 'pagos_estado_check']
  loop
    begin
      execute format('alter table public.pagos validate constraint %I', c);
    exception when check_violation then
      raise notice 'pagos: hay filas antiguas que no cumplen %; revisarlas y ejecutar VALIDATE CONSTRAINT', c;
    end;
  end loop;
end $$;

-- 2.3 FK created_by: permitir borrar usuarios que registraron pagos.
alter table public.pagos drop constraint if exists pagos_created_by_fkey;
alter table public.pagos
  add constraint pagos_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;

-- 2.4 Índices (FK + filtros de estado usados en stats y policies).
create index if not exists pagos_reservation_idx on public.pagos (reservation_id);
create index if not exists pagos_estado_idx      on public.pagos (estado);

-- ----------------------------------------------------------------------------
-- 3. VEHICLES
-- ----------------------------------------------------------------------------

-- anon leía la tabla completa (notes internas, vehículos en mantenimiento,
-- created_by). El catálogo usa get_public_vehicles(_v2), get_public_vehicle_by_id,
-- get_public_vehicle_for_reservation (SECURITY DEFINER), así que no se rompe.
drop policy if exists "Public catalog can view vehicles" on public.vehicles;

-- ----------------------------------------------------------------------------
-- 4. updated_at automáticos (pagos y vehicles no tenían trigger)
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pagos_set_updated_at on public.pagos;
create trigger pagos_set_updated_at
  before update on public.pagos
  for each row execute function public.set_updated_at();

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. FUNCIONES
-- ----------------------------------------------------------------------------

-- 5.1 Sin uso en la app. is_admin solo la usaba la policy eliminada en 1.1.
--     Sin CASCADE: si algo más dependiera de ellas, la migración fallaría
--     en vez de borrar dependencias en silencio.
drop function if exists public.debug_auth_context();
drop function if exists public.is_admin();
drop function if exists public.get_current_role();

-- 5.2 cleanup_orphan_vehicle_images: antes comparaba image_urls con
--     'https://vehicles.supabase.co/...' (nombre del bucket como host), que
--     nunca coincide con la URL real → TODO archivo con más de N horas se
--     consideraba huérfano. Ahora compara por path dentro del bucket.
create or replace function public.cleanup_orphan_vehicle_images(max_age_hours int default 24)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_count int := 0;
  cutoff timestamptz := now() - make_interval(hours => max_age_hours);
begin
  with referenced_paths as (
    select distinct split_part(url, '/storage/v1/object/public/vehicles/', 2) as path
    from public.vehicles v,
         lateral unnest(coalesce(v.image_urls, '{}'::text[])) as url
    where url like '%/storage/v1/object/public/vehicles/%'
  )
  delete from storage.objects o
  where o.bucket_id = 'vehicles'
    and o.created_at < cutoff
    and not exists (
      select 1 from referenced_paths r where r.path = o.name
    );

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.cleanup_orphan_vehicle_images(int) from public, anon, authenticated;
grant execute on function public.cleanup_orphan_vehicle_images(int) to service_role;

-- 5.3 EXECUTE mínimo en funciones SECURITY DEFINER internas.
revoke all on function public.user_owns_reservation(uuid) from public, anon;
grant execute on function public.user_owns_reservation(uuid) to authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated;

commit;

-- ============================================================================
-- Fin de 019_security_hardening.sql
-- ============================================================================
