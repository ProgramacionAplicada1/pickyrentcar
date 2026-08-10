-- ============================================================================
-- PickyRentCar — 006_drop_huérfana_authenticated_read_vehicles.sql
-- ============================================================================

drop policy if exists "Authenticated users can read vehicles" on public.vehicles;

-- ============================================================================
-- Fin de 006_drop_huérfana_authenticated_read_vehicles.sql
-- ============================================================================