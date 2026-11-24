-- ============================================================================
-- PickyRentCar — 021_reservation_number_max.sql
-- ============================================================================
-- count_reservations_by_year contaba las reservas del año y la app usaba
-- count + 1 como siguiente correlativo (PKR-AAAA-NNNN). Si se borra alguna
-- reserva, el conteo queda por debajo del número más alto y el siguiente
-- número choca con reservations_numero_key → no se pueden crear reservas.
--
-- Ahora devuelve el MAYOR correlativo usado en el año (0 si no hay). Mismo
-- nombre y firma, así la app no cambia: siguiente = resultado + 1.
-- La app además reintenta ante 23505 (services/catalog.ts) por si dos
-- reservas se crean a la vez.
-- Idempotente.
-- ============================================================================

create or replace function public.count_reservations_by_year(p_year int)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(max(split_part(r.numero, '-', 3)::bigint), 0)
  from public.reservations r
  where r.numero ~ ('^PKR-' || p_year::text || '-[0-9]+$');
$$;

grant execute on function public.count_reservations_by_year(int) to anon, authenticated;

-- ============================================================================
-- Fin de 021_reservation_number_max.sql
-- ============================================================================
