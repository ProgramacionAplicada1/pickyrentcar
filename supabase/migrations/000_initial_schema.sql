-- ============================================================================
-- PickyRentCar — 000_initial_schema.sql
-- ============================================================================
-- Snapshot ejecutable del esquema INICIAL de la base de datos.
-- Esta migración recrea el estado que existía en producción a julio de 2026,
-- ANTES de los cambios de 001_vehicles_reservations.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. public.profiles + RLS
-- ----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 2. Función handle_new_user() + trigger on_auth_user_created
-- ----------------------------------------------------------------------------
-- Crea un profile automáticamente al registrarse un usuario, extrayendo
-- el full_name desde raw_user_meta_data->>'full_name'.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. public.vehicles (forma ORIGINAL — pre-multi-tenant)
-- ----------------------------------------------------------------------------
-- Diferencias con la versión actual (post-001):
--   • image_url text          (singular) en lugar de image_urls text[]
--   • Sin columnas: nombre, daily_price, transmission, fuel_type, category
--   • RLS "Authenticated can …" para todos los admins autenticados
--     (todos los admins compartían la flota)

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  plate text not null,
  brand text not null,
  model text not null,
  year int not null,
  color text,
  seats int default 5,
  status text not null default 'available',
  notes text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vehicles_plate_unique unique (plate)
);

create index if not exists vehicles_created_by_idx
  on public.vehicles(created_by);

create index if not exists vehicles_status_idx
  on public.vehicles(status);

alter table public.vehicles enable row level security;

drop policy if exists "Authenticated can view vehicles"   on public.vehicles;
drop policy if exists "Authenticated can insert vehicles" on public.vehicles;
drop policy if exists "Authenticated can update vehicles" on public.vehicles;
drop policy if exists "Authenticated can delete vehicles" on public.vehicles;

create policy "Authenticated can view vehicles"
  on public.vehicles for select using (auth.uid() is not null);

create policy "Authenticated can insert vehicles"
  on public.vehicles for insert with check (auth.uid() is not null);

create policy "Authenticated can update vehicles"
  on public.vehicles for update using (auth.uid() is not null);

create policy "Authenticated can delete vehicles"
  on public.vehicles for delete using (auth.uid() is not null);

-- ----------------------------------------------------------------------------
-- 4. storage.buckets — bucket público "vehicles"
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('vehicles', 'vehicles', true)
on conflict (id) do update set public = excluded.public;

-- ----------------------------------------------------------------------------
-- 5. storage.objects — las 4 policies ORIGINALES
-- ----------------------------------------------------------------------------
-- Convención de path: {user_id}/{timestamp}-{random}.{ext}
-- (sin slots — una sola imagen por vehículo en este estado)

drop policy if exists "Public read of vehicle images"            on storage.objects;
drop policy if exists "Authenticated can upload vehicle images"  on storage.objects;
drop policy if exists "Authenticated can update vehicle images"  on storage.objects;
drop policy if exists "Authenticated can delete vehicle images"  on storage.objects;

create policy "Public read of vehicle images"
  on storage.objects for select using (bucket_id = 'vehicles');

create policy "Authenticated can upload vehicle images"
  on storage.objects for insert with check (
    bucket_id = 'vehicles' and auth.uid() is not null
  );

create policy "Authenticated can update vehicle images"
  on storage.objects for update using (
    bucket_id = 'vehicles' and auth.uid() is not null
  );

create policy "Authenticated can delete vehicle images"
  on storage.objects for delete using (
    bucket_id = 'vehicles' and auth.uid() is not null
  );

-- ============================================================================
-- Fin de 000_initial_schema.sql.
