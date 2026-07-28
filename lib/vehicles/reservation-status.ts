export const RESERVATION_STATUSES = [
  "pendiente",
  "confirmada",
  "activa",
  "finalizada",
  "cancelada",
] as const

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number]

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  activa: "Activa",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
}

export const RESERVATION_STATUS_ORDER: ReservationStatus[] = [
  "pendiente",
  "confirmada",
  "activa",
  "finalizada",
  "cancelada",
]

export function nextReservationStatus(
  status: ReservationStatus,
): ReservationStatus | null {
  const map: Record<ReservationStatus, ReservationStatus | null> = {
    pendiente: "confirmada",
    confirmada: "activa",
    activa: "finalizada",
    finalizada: null,
    cancelada: null,
  }
  return map[status]
}