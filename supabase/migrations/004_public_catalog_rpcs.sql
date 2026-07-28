-- ============================================================================
-- PickyRentCar — 004_public_catalog_rpcs.sql
-- ============================================================================
-- RPCs con SECURITY DEFINER para que el catálogo público funcione para
-- usuarios anónimos y autenticados (clientes) sin necesidad de service_role.
--
-- SECURITY DEFINER: cada función corre con permisos del owner (postgres), no
-- del usuario que la llama. Bypassea RLS de la tabla subyacente.
--
-- Solo exponen columnas seguras: vehículos con campos públicos + fechas de
-- disponibilidad (no datos personales de clientes).
--
-- Aplicar DESPUÉS de 002_public_catalog_rls.sql y 003_handle_new_user_role.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Lista de vehículos del catálogo (excluye maintenance)
-- ----------------------------------------------------------------------------
create or replace function public.get_public_vehicles()
returns table (
  id uuid,
  nombre text,
  plate text,
  brand text,
  model text,
  year int,
  status text,
  transmission text,
  fuel_type text,
  category text,
  daily_price numeric,
  image_urls text[]
)
language sql
security definer
set search_path = public
as $$
  select
    id, nombre, plate, brand, model, year, status, transmission,
    fuel_type, category, daily_price, image_urls
  from vehicles
  where status <> 'maintenance'
  order by created_at desc;
$$;
grant execute on function public.get_public_vehicles to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2. Detalle de un vehículo del catálogo
-- ----------------------------------------------------------------------------
create or replace function public.get_public_vehicle_by_id(p_id uuid)
returns table (
  id uuid,
  nombre text,
  plate text,
  brand text,
  model text,
  year int,
  color text,
  seats int,
  status text,
  transmission text,
  fuel_type text,
  category text,
  daily_price numeric,
  image_urls text[]
)
language sql
security definer
set search_path = public
as $$
  select
    id, nombre, plate, brand, model, year, color, seats, status,
    transmission, fuel_type, category, daily_price, image_urls
  from vehicles
  where id = p_id;
$$;
grant execute on function public.get_public_vehicle_by_id to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Rangos de fechas reservadas para un vehículo (solo fechas, no PII)
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
    and status not in ('cancelada', 'finalizada');
$$;
grant execute on function public.get_reserved_ranges_for_vehicle to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. Vehicle mínimo para crear reserva (daily_price + status)
-- ----------------------------------------------------------------------------
create or replace function public.get_public_vehicle_for_reservation(p_id uuid)
returns table (id uuid, daily_price numeric, status text)
language sql
security definer
set search_path = public
as $$
  select id, daily_price, status
  from vehicles
  where id = p_id;
$$;
grant execute on function public.get_public_vehicle_for_reservation to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. Conteo de reservas del año (para generar número PKR-YYYY-NNNN)
-- ----------------------------------------------------------------------------
create or replace function public.count_reservations_by_year(p_year int)
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint
  from reservations
  where numero like ('PKR-' || p_year::text || '-%');
$$;
grant execute on function public.count_reservations_by_year to anon, authenticated;

-- ============================================================================
-- Fin de 004_public_catalog_rpcs.sql
