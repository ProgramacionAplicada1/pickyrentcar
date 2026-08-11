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

export const MAX_VEHICLE_IMAGES = 5 as const

export type VehicleImageSlot = 1 | 2 | 3 | 4 | 5