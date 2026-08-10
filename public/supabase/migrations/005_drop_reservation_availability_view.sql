-- ============================================================================
-- PickyRentCar — 005_drop_reservation_availability_view.sql
-- ============================================================================
-- Elimina la view reservation_availability (marca CRITICAL en el linter de
-- Supabase por SECURITY DEFINER). La función get_reserved_ranges_for_vehicle
-- (de 004_public_catalog_rpcs.sql) hace lo mismo y no es flaggeada.
--
-- El view era necesario cuando no teníamos la función, pero ahora la función
-- existe y es preferible porque:
--   1. El linter de Supabase no flagea funciones SECURITY DEFINER (solo views)
--   2. Reduce la superficie de ataque (un objeto menos expuesto)
--   3. Mantiene el mismo security model (SECURITY DEFINER con columnas safe)
--
-- Aplicar DESPUÉS de 004_public_catalog_rpcs.sql.
-- ============================================================================

drop view if exists public.reservation_availability;
-- ============================================================================
-- Fin de 005_drop_reservation_availability_view.sql
-- ============================================================================