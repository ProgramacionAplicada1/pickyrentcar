-- ============================================================================
-- PickyRentCar — 011_my_reservations.sql
-- Permite que cada cliente autenticado consulte exclusivamente sus reservas.
-- También endurece el INSERT público para impedir asociar una reserva al
-- client_id de otro usuario.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. El cliente puede leer únicamente sus propias reservaciones.
--    La política existente del dueño del vehículo se mantiene, por lo que
--    los administradores siguen viendo las reservas de su flota.
-- ---------------------------------------------------------------------------

drop policy if exists "Clients can read own reservations" on public.reservations;

create policy "Clients can read own reservations"
  on public.reservations for select
  using (client_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. Endurecer el alta pública.
--    - Invitado: client_id debe ser NULL.
--    - Usuario autenticado: client_id puede ser NULL o su propio auth.uid().
-- ---------------------------------------------------------------------------

drop policy if exists "Anyone can create reservation" on public.reservations;

create policy "Anyone can create reservation"
  on public.reservations for insert
  with check (
    (auth.uid() is null and client_id is null)
    or
    (auth.uid() is not null and (client_id is null or client_id = auth.uid()))
  );

-- ============================================================================
-- Fin de migración.
-- ============================================================================
