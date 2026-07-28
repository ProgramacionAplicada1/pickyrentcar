-- ============================================================================
-- PickyRentCar — migración: vehículos multi-tenant + tabla de reservaciones
-- ============================================================================
-- Ejecutar en Supabase SQL Editor en el orden presentado.
-- Idempotente: usar IF NOT EXISTS / DROP IF EXISTS para re-ejecución segura.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Vehicles: nuevos campos
-- ----------------------------------------------------------------------------

alter table public.vehicles
  add column if not exists nombre text,
  add column if not exists daily_price numeric(10,2) not null default 0,
  add column if not exists transmission text not null default 'Automático',
  add column if not exists fuel_type text not null default 'Gasolina',
  add column if not exists category text not null default 'Sedán',
  add column if not exists image_urls text[] not null default '{}';

-- ----------------------------------------------------------------------------
-- 2. Vehicles: migración image_url → image_urls[0] y eliminación de image_url
-- ----------------------------------------------------------------------------

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'vehicles'
      and column_name = 'image_url'
  ) then
    update public.vehicles
    set image_urls = array_append(image_urls, image_url)
    where image_url is not null
      and not (image_url = any(image_urls));

    alter table public.vehicles drop column image_url;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 3. Vehicles: RLS multi-tenant (cada admin solo ve sus vehículos)
-- ----------------------------------------------------------------------------

drop policy if exists "Authenticated can view vehicles"   on public.vehicles;
drop policy if exists "Authenticated can insert vehicles" on public.vehicles;
drop policy if exists "Authenticated can update vehicles" on public.vehicles;
drop policy if exists "Authenticated can delete vehicles" on public.vehicles;

create policy "Owners can view vehicles"
  on public.vehicles for select
  using (auth.uid() = created_by);

create policy "Owners can insert vehicles"
  on public.vehicles for insert
  with check (auth.uid() = created_by);

create policy "Owners can update vehicles"
  on public.vehicles for update
  using (auth.uid() = created_by);

create policy "Owners can delete vehicles"
  on public.vehicles for delete
  using (auth.uid() = created_by);

-- ----------------------------------------------------------------------------
-- 4. (Opcional) Reasignar vehículos existentes sin dueño
--    Reemplazar '<UUID_ADMIN>' con el UUID del primer admin registrado.
-- ----------------------------------------------------------------------------

-- no fue necesario usarlo ya que los vehículos existentes ya tenían created_by asignado.

-- update public.vehicles
-- set created_by = '<UUID_ADMIN>'
-- where created_by is null;

-- ----------------------------------------------------------------------------
-- 5. Tabla de reservaciones
-- ----------------------------------------------------------------------------

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),

  numero text not null unique,

  vehicle_id uuid not null references public.vehicles(id) on delete cascade,

  client_name text not null,
  client_email text,
  client_phone text,

  start_date date not null,
  end_date date not null,
  days int not null,

  daily_price numeric(10,2) not null,
  total_price numeric(10,2) not null,

  status text not null default 'pendiente'
    check (status in ('pendiente','confirmada','activa','finalizada','cancelada')),

  notes text,
  location text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint reservations_dates_valid check (end_date >= start_date),
  constraint reservations_days_valid  check (days >= 1)
);

create index if not exists reservations_vehicle_idx
  on public.reservations(vehicle_id);

create index if not exists reservations_status_idx
  on public.reservations(status);

-- Índice para búsqueda eficiente por rango de fechas (overlap check).
-- Requiere extensión btree_gist para el tipo daterange.
create extension if not exists btree_gist;

create index if not exists reservations_dates_idx
  on public.reservations using gist (vehicle_id, daterange(start_date, end_date, '[]'));

-- ----------------------------------------------------------------------------
-- 6. RLS para reservaciones
--    - Cualquiera puede crear (catálogo público).
--    - Solo el dueño del vehículo puede leer/actualizar/borrar.
-- ----------------------------------------------------------------------------

alter table public.reservations enable row level security;

drop policy if exists "Anyone can create reservation"        on public.reservations;
drop policy if exists "Vehicle owners can read reservations"  on public.reservations;
drop policy if exists "Vehicle owners can update reservations" on public.reservations;
drop policy if exists "Vehicle owners can delete reservations" on public.reservations;

create policy "Anyone can create reservation"
  on public.reservations for insert
  with check (true);

create policy "Vehicle owners can read reservations"
  on public.reservations for select
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = reservations.vehicle_id
        and v.created_by = auth.uid()
    )
  );

create policy "Vehicle owners can update reservations"
  on public.reservations for update
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = reservations.vehicle_id
        and v.created_by = auth.uid()
    )
  );

create policy "Vehicle owners can delete reservations"
  on public.reservations for delete
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = reservations.vehicle_id
        and v.created_by = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 7. Trigger para mantener updated_at en reservations
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservations_set_updated_at on public.reservations;

create trigger reservations_set_updated_at
  before update on public.reservations
  for each row
  execute function public.set_updated_at();

-- (Opcional: mismo trigger para vehicles si se desea)
-- drop trigger if exists vehicles_set_updated_at on public.vehicles;
-- create trigger vehicles_set_updated_at
--   before update on public.vehicles
--   for each row
--   execute function public.set_updated_at();

-- ============================================================================
-- Fin de migración.
-- ============================================================================