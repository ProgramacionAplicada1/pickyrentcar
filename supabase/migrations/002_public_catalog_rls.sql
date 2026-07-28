-- ============================================================================
-- PickyRentCar — 002_public_catalog_rls.sql
-- ============================================================================
-- Habilita el catálogo público (/catalogo) para usuarios anónimos SIN
-- comprometer el aislamiento multi-tenant del dashboard.
--
-- Problema: las políticas RLS de vehicles y reservations usaban
-- `auth.uid() = created_by`, lo que retorna false para el rol `anon`
-- (auth.uid() es null). Resultado: ningún visitante sin sesión veía
-- vehículos en /catalogo.
--
-- Solución: agregar políticas scope-eadas al rol `anon`. Las políticas
-- existentes (scope `authenticated`) se mantienen y se combinan con OR,
-- preservando el aislamiento multi-tenant del dashboard.
--
-- Para reservaciones: en lugar de exponer la tabla completa (que tiene
-- datos personales de clientes), creamos:
--   • Una vista `reservation_availability` con solo fechas (anon puede leerla)
--   • Una función RPC `check_vehicle_availability` con SECURITY DEFINER
--     para validar overlap sin que anon vea la tabla subyacente
--
-- Aplicar DESPUÉS de 001_vehicles_reservations.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Política RLS: usuarios anónimos pueden ver todos los vehículos
-- ----------------------------------------------------------------------------
-- Scope-eada a `anon` (no aplica a `authenticated`). Las políticas
-- existentes para `authenticated` siguen activas: multi-tenant intacto.

drop policy if exists "Public catalog can view vehicles" on public.vehicles;

create policy "Public catalog can view vehicles"
  on public.vehicles for select
  to anon
  using (true);

-- ----------------------------------------------------------------------------
-- 2. Vista `reservation_availability`: solo fechas, oculta datos personales
-- ----------------------------------------------------------------------------
-- `reservations` contiene client_name, client_email, client_phone.
-- Para el calendario público solo necesitamos disponibilidad (fechas),
-- así que creamos una vista que proyecta solo lo necesario.

create or replace view public.reservation_availability as
  select
    vehicle_id,
    start_date,
    end_date,
    status
  from public.reservations
  where status not in ('cancelada', 'finalizada');

grant select on public.reservation_availability to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. RPC `check_vehicle_availability`: overlap check sin exponer la tabla
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER: corre con permisos del owner de la función, no del
-- usuario que la llama. Anon puede ejecutarla pero no puede SELECT sobre
-- la tabla `reservations`. Devuelve true si el vehículo está libre en
-- el rango indicado, false si hay solapamiento.

create or replace function public.check_vehicle_availability(
  p_vehicle_id uuid,
  p_start_date date,
  p_end_date date
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.reservations
    where vehicle_id = p_vehicle_id
      and status not in ('cancelada', 'finalizada')
      and start_date <= p_end_date
      and end_date >= p_start_date
  );
$$;

grant execute on function public.check_vehicle_availability to anon, authenticated;
