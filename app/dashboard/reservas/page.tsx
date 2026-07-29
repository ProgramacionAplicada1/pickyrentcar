import { createClient } from "@/lib/supabase/server"

import ReservationHeader from "./components/layout/ReservationHeader"
import ReservationStats from "./components/layout/ReservationStats"
import ReservationToolbar from "./components/layout/ReservationToolbar"
import ReservationTabs from "./components/layout/ReservationTabs"
import ReservationList from "./components/layout/ReservationList"

import {
  mapReservation,
  type ReservationDatabaseRow,
} from "./data/mapReservation"

export default async function ReservationsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("reservations")
    .select(`
      id,
      numero,
      vehicle_id,
      client_name,
      client_email,
      client_phone,
      start_date,
      end_date,
      days,
      daily_price,
      total_price,
      status,
      notes,
      location,
      created_at,
      updated_at,

      vehicle:vehicles (
        id,
        nombre,
        plate,
        brand,
        model,
        year,
        color,
        seats,
        status,
        daily_price,
        transmission,
        fuel_type,
        category,
        image_urls
      )
    `)
    .order("created_at", {
      ascending: false,
    })
console.log("========== SUPABASE RESERVATIONS ==========")
console.log("Error:", error)
console.log("Cantidad:", data?.length ?? 0)
console.dir(data, { depth: null })
console.log("===========================================")

  if (error) {
    console.error(
      "Error cargando las reservas:",
      error.message
    )
  }

  const reservationRows =
    (data ?? []) as unknown as ReservationDatabaseRow[]

  const reservations = reservationRows.map(mapReservation)
  console.log("RESERVAS TRANSFORMADAS:")
  console.dir(reservations, { depth: null })

  return (
    <div className="space-y-8 p-6">
      <ReservationHeader />

      <ReservationStats />

      <ReservationToolbar />

      <ReservationTabs />

      {error ? (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-bold text-red-800">
            No se pudieron cargar las reservas
          </h2>

          <p className="mt-1 text-sm text-red-600">
            {error.message}
          </p>
        </section>
      ) : (
        <ReservationList reservations={reservations} />
      )}
    </div>
  )
}