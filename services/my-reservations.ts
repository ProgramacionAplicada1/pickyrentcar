import { createClient } from "@/lib/supabase/server"
import { expireOverdueReservations } from "@/services/reservations"

export type MyReservationVehicle = {
  id: string
  nombre: string | null
  brand: string
  model: string
  year: number
  plate: string
  category: string
  transmission: string
  fuel_type: string
  image_urls: string[]
}

export type MyReservation = {
  id: string
  numero: string
  vehicle_id: string
  client_name: string
  client_email: string | null
  client_phone: string | null
  start_date: string
  end_date: string
  days: number
  daily_price: number
  total_price: number
  status: string
  payment_due_at: string | null
  notes: string | null
  location: string | null
  created_at: string
  updated_at: string
  vehicle: MyReservationVehicle | null
  /** Último pago reportado (pendiente, completado o rechazado). */
  latest_payment: MyReservationPayment | null
}

export type MyReservationPayment = {
  id: string
  estado: "pendiente" | "completado" | "fallido" | "reembolsado"
  metodo_pago: string
  referencia: string | null
  motivo_rechazo: string | null
  created_at: string
}

type ReservationDbRow = Omit<MyReservation, "vehicle" | "latest_payment"> & {
  vehicle_id: string
}

type PublicVehicleRow = {
  id: string
  nombre: string | null
  brand: string
  model: string
  year: number
  plate: string
  category: string
  transmission: string
  fuel_type: string
  image_urls: unknown
}

function normalizeImageUrls(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : []
}

function normalizeVehicle(row: PublicVehicleRow): MyReservationVehicle {
  return {
    id: String(row.id),
    nombre: row.nombre ?? null,
    brand: String(row.brand ?? ""),
    model: String(row.model ?? ""),
    year: Number(row.year ?? 0),
    plate: String(row.plate ?? ""),
    category: String(row.category ?? ""),
    transmission: String(row.transmission ?? ""),
    fuel_type: String(row.fuel_type ?? ""),
    image_urls: normalizeImageUrls(row.image_urls),
  }
}

const MY_RESERVATION_COLUMNS =
  "id, numero, vehicle_id, client_name, client_email, client_phone, start_date, end_date, days, daily_price, total_price, status, payment_due_at, notes, location, created_at, updated_at"

async function getLatestPaymentMap(reservationIds: string[]) {
  const map = new Map<string, MyReservationPayment>()
  if (reservationIds.length === 0) return map

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pagos")
    .select("id, reservation_id, estado, metodo_pago, referencia, motivo_rechazo, created_at")
    .in("reservation_id", reservationIds)
    .order("created_at", { ascending: false })

  if (error) return map

  for (const row of data ?? []) {
    const id = String(row.reservation_id)
    if (map.has(id)) continue // ya tenemos el más reciente
    map.set(id, {
      id: String(row.id),
      estado: row.estado as MyReservationPayment["estado"],
      metodo_pago: String(row.metodo_pago),
      referencia: (row.referencia as string | null) ?? null,
      motivo_rechazo: (row.motivo_rechazo as string | null) ?? null,
      created_at: String(row.created_at),
    })
  }
  return map
}

async function getVehicleMap(vehicleIds: string[]) {
  const supabase = await createClient()
  const uniqueIds = [...new Set(vehicleIds.filter(Boolean))]

  const entries = await Promise.all(
    uniqueIds.map(async (vehicleId) => {
      const { data, error } = await supabase.rpc("get_public_vehicle_by_id", {
        p_id: vehicleId,
      })

      if (error || !Array.isArray(data) || data.length === 0) {
        return [vehicleId, null] as const
      }

      return [
        vehicleId,
        normalizeVehicle(data[0] as PublicVehicleRow),
      ] as const
    }),
  )

  return new Map<string, MyReservationVehicle | null>(entries)
}

export async function listMyReservations(): Promise<MyReservation[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  await expireOverdueReservations(supabase)

  const { data, error } = await supabase
    .from("reservations")
    .select(
      MY_RESERVATION_COLUMNS,
    )
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  if (error || !data) return []

  const rows = data as ReservationDbRow[]
  const [vehicleMap, paymentMap] = await Promise.all([
    getVehicleMap(rows.map((row) => row.vehicle_id)),
    getLatestPaymentMap(rows.map((row) => row.id)),
  ])

  return rows.map((row) => ({
    ...row,
    days: Number(row.days),
    daily_price: Number(row.daily_price),
    total_price: Number(row.total_price),
    vehicle: vehicleMap.get(row.vehicle_id) ?? null,
    latest_payment: paymentMap.get(row.id) ?? null,
  }))
}

export async function getMyReservationById(
  reservationId: string,
): Promise<MyReservation | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  await expireOverdueReservations(supabase)

  const { data, error } = await supabase
    .from("reservations")
    .select(
      MY_RESERVATION_COLUMNS,
    )
    .eq("id", reservationId)
    .eq("client_id", user.id)
    .maybeSingle()

  if (error || !data) return null

  const row = data as ReservationDbRow
  const [vehicleMap, paymentMap] = await Promise.all([
    getVehicleMap([row.vehicle_id]),
    getLatestPaymentMap([row.id]),
  ])

  return {
    ...row,
    days: Number(row.days),
    daily_price: Number(row.daily_price),
    total_price: Number(row.total_price),
    vehicle: vehicleMap.get(row.vehicle_id) ?? null,
    latest_payment: paymentMap.get(row.id) ?? null,
  }
}
