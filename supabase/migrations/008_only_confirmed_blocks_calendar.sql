-- ============================================================================
-- PickyRentCar — 008_only_confirmed_blocks_calendar.sql
-- ============================================================================
-- Cambia el comportamiento del catálogo público: las reservas en estado
-- `pendiente` (sin pago confirmado) ya NO bloquean el calendario ni
-- generan overlap. Solo bloquean las reservas en `confirmada` o `activa`
-- (pago recibido).
--
-- Esto evita que una reserva que no se paga "congele" las fechas en el
-- calendario para todos los demás clientes. Las fechas solo se bloquean
-- cuando el admin confirma el pago de la reserva (status pasa a
-- `confirmada` automáticamente, ver 007).
--
-- Aplica también al overlap check `check_vehicle_availability`: dos clientes
-- pueden crear reservas pendientes sobre las mismas fechas; el conflicto
-- solo aparece cuando uno de ellos paga y la reserva pasa a `confirmada`.
--
-- Idempotente (CREATE OR REPLACE + GRANT idempotente).
-- ============================================================================

-- ----------------------------------------------------------------------so------
-- 1. get_reserved_ranges_for_vehicle: solo confirmada|activa bloquea el calendario
-- ----------------------------------------------------------------------------
create or replace function public.get_reserved_ranges_for_vehicle(p_vehicle_id uuid)
returns table (start_date date, end_date date)
language sql
security definer
set search_path = public
as $$
  select start_date, end_date
  from reservations
  where vehicle_id = p_vehicle_id
    and status in ('confirmada', 'activa');
$$;
grant execute on function public.get_reserved_ranges_for_vehicle to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2. check_vehicle_availability: solo confirmada|activa causa overlap
-- ----------------------------------------------------------------------------
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
      and status in ('confirmada', 'activa')
      and start_date <= p_end_date
      and end_date >= p_start_date
  );
$$;
grant execute on function public.check_vehicle_availability to anon, authenticated;

-- ============================================================================
-- Fin de 008_only_confirmed_blocks_calendar.sql
-- ============================================================================