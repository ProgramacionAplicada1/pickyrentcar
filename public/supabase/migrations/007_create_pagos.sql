-- ============================================================================
-- PickyRentCar — 007_create_pagos.sql
-- ============================================================================
-- Crea la tabla `pagos` con FK a `reservations`. Una reserva puede tener
-- múltiples pagos (anticipo + saldo, reembolsos).
--
-- Estados del pago: pendiente | completado | fallido | reembolsado.
-- Solo `completado` cuenta para:
--   1. Auto-promoción de reserva: `pendiente` → `confirmada`.
--   2. Stats `activas` (con status confirmada/activa).
--   3. Stats `facturado` (suma de montos).
--
-- RLS multi-tenant via EXISTS al vehículo asociado a la reserva.
-- Idempotente.
-- ============================================================================

create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  monto numeric(10,2) not null check (monto > 0),
  metodo_pago text not null check (metodo_pago in ('Tarjeta', 'Efectivo', 'Transferencia')),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'completado', 'fallido', 'reembolsado')),
  referencia text,
  notas text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pagos_reservation_idx
  on public.pagos(reservation_id);

create index if not exists pagos_estado_idx
  on public.pagos(estado);

-- ----------------------------------------------------------------------------
-- RLS multi-tenant: solo el dueño del vehículo de la reserva
-- ----------------------------------------------------------------------------

alter table public.pagos enable row level security;

drop policy if exists "Vehicle owners can read pagos"   on public.pagos;
drop policy if exists "Vehicle owners can insert pagos" on public.pagos;
drop policy if exists "Vehicle owners can update pagos" on public.pagos;
drop policy if exists "Vehicle owners can delete pagos" on public.pagos;

create policy "Vehicle owners can read pagos"
  on public.pagos for select
  using (
    exists (
      select 1 from public.reservations r
      join public.vehicles v on r.vehicle_id = v.id
      where r.id = pagos.reservation_id
        and v.created_by = auth.uid()
    )
  );

create policy "Vehicle owners can insert pagos"
  on public.pagos for insert
  with check (
    exists (
      select 1 from public.reservations r
      join public.vehicles v on r.vehicle_id = v.id
      where r.id = pagos.reservation_id
        and v.created_by = auth.uid()
    )
  );

create policy "Vehicle owners can update pagos"
  on public.pagos for update
  using (
    exists (
      select 1 from public.reservations r
      join public.vehicles v on r.vehicle_id = v.id
      where r.id = pagos.reservation_id
        and v.created_by = auth.uid()
    )
  );

create policy "Vehicle owners can delete pagos"
  on public.pagos for delete
  using (
    exists (
      select 1 from public.reservations r
      join public.vehicles v on r.vehicle_id = v.id
      where r.id = pagos.reservation_id
        and v.created_by = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Trigger para updated_at (reusa set_updated_at() existente de 001)
-- ----------------------------------------------------------------------------

drop trigger if exists pagos_set_updated_at on public.pagos;
create trigger pagos_set_updated_at
  before update on public.pagos
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- Fin de 007_create_pagos.sql
-- ============================================================================