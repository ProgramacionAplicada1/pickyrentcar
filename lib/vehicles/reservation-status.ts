export const RESERVATION_STATUSES = [
  "pendiente",
  "pendiente_pago",
  "activa",
  "finalizada",
  "cancelada",
] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pendiente: "Pendiente confirmacion",
  pendiente_pago: "Pendiente de pago",
  activa: "Activa",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
}

export const RESERVATION_STATUS_ORDER: ReservationStatus[] = [
  "pendiente",
  "pendiente_pago",
  "activa",
  "finalizada",
  "cancelada",
]

export function nextReservationStatus(
  status: ReservationStatus,
): ReservationStatus | null {
  const map: Record<ReservationStatus, ReservationStatus | null> = {
    pendiente: "pendiente_pago",
    pendiente_pago: "activa",
    activa: "finalizada",
    finalizada: null,
    cancelada: null,
  }

  return map[status];
}
