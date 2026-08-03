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

function getTodayInDominicanRepublic() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Santo_Domingo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())

  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value

  return `${year}-${month}-${day}`
}

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

  if (error) {
    console.error(
      "Error cargando las reservas:",
      error.message
    )
  }

  const reservationRows =
    (data ?? []) as unknown as ReservationDatabaseRow[]

  const reservations = reservationRows.map(mapReservation)

  // Fecha actual en República Dominicana.
  const today = getTodayInDominicanRepublic()

  const cancelledStatuses = new Set([
    "cancelada",
    "cancelado",
    "cancelled",
    "canceled",
  ])

  const finishedStatuses = new Set([
    "finalizada",
    "finalizado",
    "completada",
    "completado",
    "completed",
  ])

  const closedStatuses = new Set([
    ...cancelledStatuses,
    ...finishedStatuses,
  ])

  // Total de reservas registradas.
  const totalReservations = reservations.length

  // Reservas cuyo período incluye la fecha actual
  // y que no están canceladas o finalizadas.
  const activeReservations = reservations.filter((reservation) => {
    const status = reservation.estado
      .trim()
      .toLowerCase()

    const isInsideDateRange =
      reservation.fechaInicio <= today &&
      reservation.fechaFin >= today

    return (
      isInsideDateRange &&
      !closedStatuses.has(status)
    )
  }).length

  // Reservas que comienzan hoy.
  const todayReservations = reservations.filter(
    (reservation) => reservation.fechaInicio === today
  ).length

  // Suma de reservas no canceladas.
  // Más adelante puede reemplazarse por pagos reales.
  const billedAmount = reservations.reduce(
  (total, reservation) => {
    const status = reservation.estado
      .trim()
      .toLowerCase()

    if (cancelledStatuses.has(status)) {
      return total
    }

    const amount = Number(reservation.precio)

    return total + (
      Number.isFinite(amount) ? amount : 0
    )
  },
  0
)

const calculatePercentage = (value: number) => {
  if (totalReservations === 0) {
    return 0
  }

  return Math.round(
    (value / totalReservations) * 100
  )
}

const stats = {
  total: totalReservations,
  active: activeReservations,
  today: todayReservations,
  billed: billedAmount,

  activePercentage:
    calculatePercentage(activeReservations),

  todayPercentage:
    calculatePercentage(todayReservations),

  billedPercentage:
    billedAmount > 0 ? 100 : 0,
}

console.log("========== RESERVATION STATS ==========")
console.log({
  fechaActual: today,
  ...stats,
})
console.log("=======================================")

return (
  <div className="space-y-8 p-6">
    <ReservationHeader />

    <ReservationStats stats={stats} />

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
)}