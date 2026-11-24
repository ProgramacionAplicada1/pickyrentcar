-- ============================================================================
-- PickyRentCar — 018_reservation_status_pendiente_pago.sql
-- ============================================================================
-- La app usa el estado `pendiente_pago` (lib/vehicles/reservation-status.ts:
-- pendiente → pendiente_pago → activa → finalizada), pero el CHECK creado en
-- 001 solo permitía ('pendiente','confirmada','activa','finalizada','cancelada').
-- Esta migración alinea el CHECK con el código. Se mantiene `confirmada` por
-- compatibilidad con filas antiguas y con los RPCs de disponibilidad (008).
--
-- Idempotente: elimina el CHECK anterior (nombre por defecto de Postgres) y
-- lo vuelve a crear.
-- ============================================================================

alter table public.reservations
  drop constraint if exists reservations_status_check;

alter table public.reservations
  add constraint reservations_status_check
  check (status in (
    'pendiente',
    'pendiente_pago',
    'confirmada',
    'activa',
    'finalizada',
    'cancelada'
  ));

-- ============================================================================
-- Fin de 018_reservation_status_pendiente_pago.sql
-- ============================================================================
