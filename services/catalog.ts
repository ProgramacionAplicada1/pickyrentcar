import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"

// ============================================================================
// Types
// ============================================================================

export type PublicVehicleListItem = {
  id: string
  nombre: string | null
  plate: string
  brand: string
  model: string
  year: number
  status: string
  transmission: string
  fuel_type: string
  category: string
  daily_price: number
  image_urls: string[]
}

export type PublicVehicleDetail = PublicVehicleListItem & {
  color: string | null
  seats: number | null
}

export type ReservedRange = {
  from: string
  to: string
}

export type PublicReservationFieldErrors = Partial<
  Record<
    | "vehicle_id"
    | "start_date"
    | "end_date"
    | "daily_price"
    | "client_name"
    | "client_email"
    | "client_phone"
    | "notes",
    string
  >
>

export type PublicReservationResult =
  | { ok: true; numero: string }
  | {
      ok: false
      error: string
      fieldErrors?: PublicReservationFieldErrors
    }

// ============================================================================
// Helpers
// ============================================================================

function normalizeImageUrls(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : []
}

// ============================================================================
// Queries
// ============================================================================

export async function listPublicVehicles(): Promise<PublicVehicleListItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("vehicles")
    .select(
      "id, nombre, plate, brand, model, year, status, transmission, fuel_type, category, daily_price, image_urls",
    )
    .neq("status", "maintenance")
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => ({
    ...(row as Omit<PublicVehicleListItem, "image_urls">),
    image_urls: normalizeImageUrls(
      (row as { image_urls?: unknown }).image_urls,
    ),
  }))
}

export async function getPublicVehicleById(
  id: string,
): Promise<PublicVehicleDetail | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("vehicles")
    .select(
      "id, nombre, plate, brand, model, year, color, seats, status, transmission, fuel_type, category, daily_price, image_urls",
    )
    .eq("id", id)
    .maybeSingle()

  if (!data) return null

  return {
    ...(data as Omit<PublicVehicleDetail, "image_urls">),
    image_urls: normalizeImageUrls(
      (data as { image_urls?: unknown }).image_urls,
    ),
  }
}

export async function getVehicleReservedRanges(
  vehicleId: string,
): Promise<ReservedRange[]> {
  const supabase = await createClient()
  // Vista pública con solo fechas (anon puede leerla; la tabla completa no)
  const { data } = await supabase
    .from("reservation_availability")
    .select("start_date, end_date")
    .eq("vehicle_id", vehicleId)

  return (data ?? []).map((r) => ({
    from: String(r.start_date),
    to: String(r.end_date),
  }))
}

// ============================================================================
// Mutations
// ============================================================================

function nextReservationNumber(year: number, seq: number): string {
  return `PKR-${year}-${String(seq).padStart(4, "0")}`
}

export async function createPublicReservation(
  formData: FormData,
): Promise<PublicReservationResult> {
  const vehicleId = String(formData.get("vehicle_id") ?? "").trim()
  const startDate = String(formData.get("start_date") ?? "").trim()
  const endDate = String(formData.get("end_date") ?? "").trim()
  const dailyPriceStr = String(formData.get("daily_price") ?? "").trim()
  const clientName = String(formData.get("client_name") ?? "").trim()
  const clientEmail = String(formData.get("client_email") ?? "").trim()
  const clientPhone = String(formData.get("client_phone") ?? "").trim()
  const notes = String(formData.get("notes") ?? "").trim()

  const fieldErrors: PublicReservationFieldErrors = {}

  if (!vehicleId) fieldErrors.vehicle_id = "Falta el vehículo."
  if (!startDate) fieldErrors.start_date = "Selecciona una fecha de inicio."
  if (!endDate) fieldErrors.end_date = "Selecciona una fecha de fin."
  if (!clientName) fieldErrors.client_name = "Tu nombre es obligatorio."
  if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
    fieldErrors.client_email = "Correo no válido."
  }
  if (!clientPhone) fieldErrors.client_phone = "Tu teléfono es obligatorio."

  const dailyPrice = Number(dailyPriceStr)
  if (Number.isNaN(dailyPrice) || dailyPrice < 0) {
    fieldErrors.daily_price = "Tarifa inválida."
  }

  if (!startDate || !endDate) {
    return {
      ok: false,
      error: "Selecciona fechas válidas.",
      fieldErrors,
    }
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return {
      ok: false,
      error: "Fechas inválidas.",
      fieldErrors,
    }
  }
  if (end < start) {
    return {
      ok: false,
      error:
        "La fecha de fin debe ser igual o posterior a la fecha de inicio.",
      fieldErrors: {
        end_date: "Debe ser posterior o igual a la fecha de inicio.",
      },
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (start < today) {
    return {
      ok: false,
      error: "La fecha de inicio no puede ser en el pasado.",
      fieldErrors: {
        start_date: "Debe ser hoy o posterior.",
      },
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: "Revisa los campos resaltados.",
      fieldErrors,
    }
  }

  const supabase = await createClient()

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id, daily_price, status")
    .eq("id", vehicleId)
    .maybeSingle()

  if (vehicleError || !vehicle) {
    return {
      ok: false,
      error: "El vehículo seleccionado no existe.",
    }
  }

  if (vehicle.status === "maintenance") {
    return {
      ok: false,
      error:
        "Este vehículo está en mantenimiento y no se puede reservar en este momento.",
    }
  }

  // Overlap check vía RPC (anon no puede SELECT directo sobre la tabla).
  // `false` significa que hay solapamiento.
  const { data: isAvailable } = await supabase.rpc(
    "check_vehicle_availability",
    {
      p_vehicle_id: vehicleId,
      p_start_date: startDate,
      p_end_date: endDate,
    },
  )

  if (isAvailable === false) {
    return {
      ok: false,
      error:
        "El vehículo ya tiene una reserva que coincide con esas fechas. Por favor, elige otro rango.",
    }
  }

  const days =
    Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    ) + 1
  const totalPrice = days * Number(vehicle.daily_price)

  const year = start.getFullYear()
  const { count: yearCount } = await supabase
    .from("reservations")
    .select("*", { count: "exact", head: true })
    .ilike("numero", `PKR-${year}-%`)

  const seq = (yearCount ?? 0) + 1
  const numero = nextReservationNumber(year, seq)

  const { error: insertError } = await supabase.from("reservations").insert({
    numero,
    vehicle_id: vehicleId,
    client_name: clientName,
    client_email: clientEmail || null,
    client_phone: clientPhone,
    start_date: startDate,
    end_date: endDate,
    days,
    daily_price: Number(vehicle.daily_price),
    total_price: totalPrice,
    status: "pendiente",
    notes: notes || null,
  })

  if (insertError) {
    return {
      ok: false,
      error:
        "No pudimos registrar la reserva. Por favor, inténtalo de nuevo en unos segundos.",
    }
  }

  redirect(`/catalogo/gracias?numero=${encodeURIComponent(numero)}`)
}