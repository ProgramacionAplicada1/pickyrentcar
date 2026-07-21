import { VEHICLE_STATUSES, type VehicleStatus } from "./types"

export type VehicleFormData = {
  plate: string
  brand: string
  model: string
  year: number
  color: string | null
  seats: number
  status: VehicleStatus
  notes: string | null
  image_url: string | null
}

export type VehicleFieldErrors = Partial<Record<keyof VehicleFormData, string>>

export type VehicleFormState =
  | { ok: true; data: VehicleFormData }
  | { ok: false; errors: VehicleFieldErrors }

export function validateVehicleForm(formData: FormData): VehicleFormState {
  const plate = String(formData.get("plate") ?? "").trim().toUpperCase()
  const brand = String(formData.get("brand") ?? "").trim()
  const model = String(formData.get("model") ?? "").trim()
  const yearStr = String(formData.get("year") ?? "").trim()
  const color = String(formData.get("color") ?? "").trim()
  const seatsStr = String(formData.get("seats") ?? "5").trim()
  const status = String(formData.get("status") ?? "available")
  const notes = String(formData.get("notes") ?? "").trim()
  const imageUrl = String(formData.get("image_url") ?? "").trim()

  const errors: VehicleFieldErrors = {}

  if (!plate || plate.length < 2) {
    errors.plate = "La placa debe tener al menos 2 caracteres."
  }
  if (!brand) errors.brand = "La marca es obligatoria."
  if (!model) errors.model = "El modelo es obligatorio."

  const year = Number(yearStr)
  const currentYear = new Date().getFullYear() + 1
  if (!yearStr || Number.isNaN(year) || year < 1900 || year > currentYear) {
    errors.year = `El año debe estar entre 1900 y ${currentYear}.`
  }

  const seats = Number(seatsStr || 5)
  if (!Number.isInteger(seats) || seats < 1 || seats > 50) {
    errors.seats = "Los asientos deben estar entre 1 y 50."
  }

  if (!VEHICLE_STATUSES.includes(status as VehicleStatus)) {
    errors.status = "Estado inválido."
  }

  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    errors.image_url = "La URL debe comenzar con http:// o https://."
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      plate,
      brand,
      model,
      year,
      color: color || null,
      seats,
      status: status as VehicleStatus,
      notes: notes || null,
      image_url: imageUrl || null,
    },
  }
}
