import {
  VEHICLE_STATUSES,
  type VehicleStatus,
  MAX_VEHICLE_IMAGES,
} from "./types"
import {
  VEHICLE_BRANDS,
  VEHICLE_CATEGORIES,
  VEHICLE_COLORS,
  VEHICLE_FUEL_TYPES,
  VEHICLE_TRANSMISSIONS,
  MODELS_BY_BRAND,
  type VehicleBrand,
} from "@/lib/vehicles/catalog"

export type VehicleFormData = {
  nombre: string | null
  plate: string
  brand: string
  model: string
  year: number
  color: string | null
  seats: number
  status: VehicleStatus
  transmission: string
  fuel_type: string
  category: string
  daily_price: number
  notes: string | null
  image_urls: string[]
}

export type VehicleFieldErrors = Partial<
  Record<keyof Omit<VehicleFormData, "image_urls">, string>
> & {
  images?: string
}

export type VehicleFormState =
  | { ok: true; data: VehicleFormData }
  | { ok: false; errors: VehicleFieldErrors }

export function validateVehicleForm(formData: FormData): VehicleFormState {
  const nombre = String(formData.get("nombre") ?? "").trim()
  const plate = String(formData.get("plate") ?? "").trim().toUpperCase()
  const brand = String(formData.get("brand") ?? "").trim()
  const model = String(formData.get("model") ?? "").trim()
  const yearStr = String(formData.get("year") ?? "").trim()
  const color = String(formData.get("color") ?? "").trim()
  const seatsStr = String(formData.get("seats") ?? "5").trim()
  const status = String(formData.get("status") ?? "available")
  const transmission = String(formData.get("transmission") ?? "Automático")
  const fuelType = String(formData.get("fuel_type") ?? "Gasolina")
  const category = String(formData.get("category") ?? "Sedán")
  const dailyPriceStr = String(formData.get("daily_price") ?? "0").trim()
  const notes = String(formData.get("notes") ?? "").trim()

  const imageUrls: string[] = []
  for (let i = 1; i <= MAX_VEHICLE_IMAGES; i++) {
    const url = String(formData.get(`image_url_${i}`) ?? "").trim()
    if (url) imageUrls.push(url)
  }

  const errors: VehicleFieldErrors = {}

  if (nombre && nombre.length > 60) {
    errors.nombre = "El nombre debe tener máximo 60 caracteres."
  }
  if (!plate || plate.length < 2) {
    errors.plate = "La placa debe tener al menos 2 caracteres."
  }
  if (!brand) {
    errors.brand = "La marca es obligatoria."
  } else if (!(VEHICLE_BRANDS as readonly string[]).includes(brand)) {
    errors.brand = "Marca inválida."
  }
  if (!model) {
    errors.model = "El modelo es obligatorio."
  } else if (brand && (VEHICLE_BRANDS as readonly string[]).includes(brand)) {
    const allowed = MODELS_BY_BRAND[brand as VehicleBrand]
    if (!allowed.includes(model)) {
      errors.model = "Modelo inválido para la marca seleccionada."
    }
  }
  if (color && !(VEHICLE_COLORS as readonly string[]).includes(color)) {
    errors.color = "Color inválido."
  }

  const year = Number(yearStr)
  const currentYear = new Date().getFullYear() + 1
  if (!yearStr || Number.isNaN(year) || year < 1900 || year > currentYear) {
    errors.year = `El año debe estar entre 1900 y ${currentYear}.`
  }

  const seats = Number(seatsStr || 5)
  if (!Number.isInteger(seats) || seats < 1 || seats > 50) {
    errors.seats = "Los asientos deben estar entre 1 y 50."
  }

  const dailyPrice = Number(dailyPriceStr)
  if (Number.isNaN(dailyPrice) || dailyPrice < 0) {
    errors.daily_price = "El precio por día debe ser un número positivo."
  }

  if (!VEHICLE_STATUSES.includes(status as VehicleStatus)) {
    errors.status = "Estado inválido."
  }
  if (!(VEHICLE_TRANSMISSIONS as readonly string[]).includes(transmission)) {
    errors.transmission = "Transmisión inválida."
  }
  if (!(VEHICLE_FUEL_TYPES as readonly string[]).includes(fuelType)) {
    errors.fuel_type = "Combustible inválido."
  }
  if (!(VEHICLE_CATEGORIES as readonly string[]).includes(category)) {
    errors.category = "Categoría inválida."
  }

  for (const url of imageUrls) {
    if (!/^https?:\/\//i.test(url)) {
      errors.images = "Alguna URL de imagen no es válida."
      break
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    data: {
      nombre: nombre || null,
      plate,
      brand,
      model,
      year,
      color: color || null,
      seats,
      status: status as VehicleStatus,
      transmission,
      fuel_type: fuelType,
      category,
      daily_price: dailyPrice,
      notes: notes || null,
      image_urls: imageUrls,
    },
  }
}