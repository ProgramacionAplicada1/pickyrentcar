// Flujo (ver supabase/migrations/022_payment_flow.sql):
//   pendiente → pendiente_pago (por pagar, aparta fechas 48 h)
//   → [pago reportado y confirmado por el admin] → confirmada (pagada)
//   → activa (en curso, vehículo entregado) → finalizada
//   cancelada: desde pendiente, pendiente_pago o confirmada (o por vencimiento)
export const RESERVATION_STATUSES = [
  "pendiente",
  "pendiente_pago",
  "confirmada",
  "activa",
  "finalizada",
  "cancelada",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pendiente: "Pendiente de aprobación",
  pendiente_pago: "Por pagar",
  confirmada: "Confirmada",
  activa: "En curso",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

export const RESERVATION_STATUS_ORDER: ReservationStatus[] = [
  ...RESERVATION_STATUSES,
];

/** Horas que tiene el cliente para pagar una reserva aceptada. */
export const PAYMENT_WINDOW_HOURS = 48;

export function isReservationStatus(value: string): value is ReservationStatus {
  return (RESERVATION_STATUSES as readonly string[]).includes(value);
}

/**
 * Siguiente estado al que el admin puede avanzar manualmente.
 * `pendiente_pago → confirmada` NO es manual: ocurre al confirmar un pago.
 */
export function nextReservationStatus(
  status: ReservationStatus,
): ReservationStatus | null {
  const map: Record<ReservationStatus, ReservationStatus | null> = {
    pendiente: "pendiente_pago",
    pendiente_pago: null,
    confirmada: "activa",
    activa: "finalizada",
    finalizada: null,
    cancelada: null,
  };

  return map[status];
}

export function canCancelReservation(status: ReservationStatus): boolean {
  return (
    status === "pendiente" ||
    status === "pendiente_pago" ||
    status === "confirmada"
  );
}

/** Estados que apartan fechas (pendiente_pago solo mientras esté vigente). */
export const BLOCKING_STATUSES: ReservationStatus[] = [
  "pendiente_pago",
  "confirmada",
  "activa",
];
