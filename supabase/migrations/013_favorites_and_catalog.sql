-- ============================================================================
-- PickyRentCar — 013_favorites_and_catalog.sql
-- ============================================================================
-- Favoritos por cliente + catálogo público v2 con cantidad de asientos.
-- Seguro para re-ejecutar: no elimina datos de usuarios, vehículos o reservas.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Favoritos
-- ----------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_vehicle_unique unique (user_id, vehicle_id)
);

create index if not exists favorites_user_idx
  on public.favorites(user_id);

create index if not exists favorites_vehicle_idx
  on public.favorites(vehicle_id);

alter table public.favorites enable row level security;

drop policy if exists "Users can read own favorites" on public.favorites;
drop policy if exists "Users can add own favorites" on public.favorites;
drop policy if exists "Users can delete own favorites" on public.favorites;

create policy "Users can read own favorites"
  on public.favorites
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add own favorites"
  on public.favorites
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own favorites"
  on public.favorites
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, delete on public.favorites to authenticated;

-- ----------------------------------------------------------------------------
-- 2. Catálogo v2
--    Se crea una función nueva en lugar de cambiar el tipo de retorno de la
--    función antigua. Así las instalaciones previas siguen siendo compatibles.
-- ----------------------------------------------------------------------------
create or replace function public.get_public_vehicles_v2()
returns table (
  id uuid,
  nombre text,
  plate text,
  brand text,
  model text,
  year int,
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
    id,
    nombre,
    plate,
    brand,
    model,
    year,
    seats,
    status,
    transmission,
    fuel_type,
    category,
    daily_price,
    image_urls
  from public.vehicles
  where status <> 'maintenance'
  order by created_at desc;
$$;

grant execute on function public.get_public_vehicles_v2() to anon, authenticated;
