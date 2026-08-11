-- ============================================================================
-- 016_pagos_rls_fix.sql
-- ----------------------------------------------------------------------------
-- Reescribe las politicas RLS de `public.pagos` para soportar el flujo
-- cliente reportando transferencias. Ademas, versiona la funcion
-- `user_owns_reservation(uuid)` que ya existia en produccion sin archivo
-- de migracion
--
-- Por que este fix:
--   - Las 4 policies originales (007_create_pagos.sql) solo permitian que
--     el dueno del vehiculo (admin) gestionara pagos. Esto bloqueaba el
--     flujo "reportTransferPayment" del cliente: al intentar INSERT en
--     pagos, RLS rechazaba la fila con "new row violates row-level
--     security policy" porque el cliente NO es dueno del vehiculo.
--   - El fix correcto es cubrir AMBAS ramas (cliente + admin) en una
--     sola policy usando `user_owns_reservation()`, que ya valida:
--       (a) `r.client_id = auth.uid()`  -- cliente autenticado
--       (b) `v.created_by = auth.uid()` -- admin dueno de la flota
--
-- Decisiones de diseno:
--   - NO se usa `is_admin()` porque su implementacion actual solo valida
--     `role='admin'` sin scope de fleet. Un admin podria ver pagos de
--     OTROS admins (agujero de seguridad multi-tenant).
--   - DELETE se restringe a admin (vehicle owner). Clientes no pueden
--     borrar pagos: el admin debe confirmar o marcar como fallido.
--
-- Es idempotente (create or replace, drop policy if exists).
-- Se ejecuta una vez despues de 015_cleanup_orphan_storage.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Parte 1: Versionar user_owns_reservation
-- ----------------------------------------------------------------------------

create or replace function public.user_owns_reservation(
  p_reservation_id uuid
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.reservations r
    where r.id = p_reservation_id
      and (
        r.client_id = auth.uid()
        or exists (
          select 1
          from public.vehicles v
          where v.id = r.vehicle_id
            and v.created_by = auth.uid()
        )
      )
  );
$$;

comment on function public.user_owns_reservation(uuid) is
  'Devuelve true si el auth.uid() actual esta vinculado a la reserva '
  'como cliente (client_id) o como dueno del vehiculo (created_by). '
  'Usada por las RLS policies de public.pagos para soportar tanto el '
  'flujo cliente (reportTransferPayment) como el flujo admin.';

revoke all on function public.user_owns_reservation(uuid) from public;
grant execute on function public.user_owns_reservation(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- Parte 2: Limpiar policies antiguas (de 007_create_pagos.sql)
-- ----------------------------------------------------------------------------

drop policy if exists "Vehicle owners can read pagos"    on public.pagos;
drop policy if exists "Vehicle owners can insert pagos"  on public.pagos;
drop policy if exists "Vehicle owners can update pagos"  on public.pagos;
drop policy if exists "Vehicle owners can delete pagos"  on public.pagos;

-- Limpieza preventiva por si quedaron policies huerfanas de intentos previos
drop policy if exists "Administradores pueden ver todos los pagos"          on public.pagos;
drop policy if exists "Administradores pueden actualizar pagos"              on public.pagos;
drop policy if exists "Clientes pueden ver sus pagos"                       on public.pagos;
drop policy if exists "Clientes pueden registrar pagos de sus reservas"     on public.pagos;

-- ----------------------------------------------------------------------------
-- Parte 3: 4 policies unificadas con user_owns_reservation()
-- ----------------------------------------------------------------------------
-- Cubre AMBAS ramas:
--   - Cliente: r.client_id = auth.uid()
--   - Admin:   v.created_by = auth.uid()
-- Multi-tenant intacto: un admin solo ve pagos de SU flota.
-- ----------------------------------------------------------------------------

-- SELECT: cliente ve los suyos; admin ve los de su flota
create policy "pagos_select_policy"
  on public.pagos for select
  to authenticated
  using ( public.user_owns_reservation(reservation_id) );

-- INSERT: cliente registra pago en su reserva; admin en su flota
create policy "pagos_insert_policy"
  on public.pagos for insert
  to authenticated
  with check ( public.user_owns_reservation(reservation_id) );

-- UPDATE: admin cambia estado (pendiente -> completado -> auto-promoción)
-- Cliente no actualiza pagos (no hay UI para eso).
-- El doble check (using + with check) previene que un admin "mueva" un pago
-- a una reserva que no le pertenece.
create policy "pagos_update_policy"
  on public.pagos for update
  to authenticated
  using ( public.user_owns_reservation(reservation_id) )
  with check ( public.user_owns_reservation(reservation_id) );

-- DELETE: solo admin (vehicle owner). Clientes NO pueden borrar pagos.
-- Razon: el admin debe confirmar o marcar como fallido, no el cliente.
create policy "pagos_delete_policy"
  on public.pagos for delete
  to authenticated
  using (
    exists (
      select 1
      from public.reservations r
      join public.vehicles v on r.vehicle_id = v.id
      where r.id = pagos.reservation_id
        and v.created_by = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Verificacion post-aplicacion (ejecutar manualmente):
--
--   select polname, cmd
--   from pg_policy
--   where polrelid = 'public.pagos'::regclass
--   order by polname;
--
-- Debe devolver 4 policies:
--   pagos_delete_policy  | DELETE
--   pagos_insert_policy  | INSERT
--   pagos_select_policy  | SELECT
--   pagos_update_policy  | UPDATE
--
-- Nombres legitimos esperados. Cualquier otro nombre es huerfano y debe
-- limpiarse con drop policy if exists.
-- ----------------------------------------------------------------------------