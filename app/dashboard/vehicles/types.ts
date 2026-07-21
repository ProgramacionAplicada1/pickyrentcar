export const VEHICLE_STATUSES = [
  "available",
  "in_use",
  "maintenance",
] as const

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number]

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "Disponible",
  in_use: "En uso",
  maintenance: "Mantenimiento",
}
