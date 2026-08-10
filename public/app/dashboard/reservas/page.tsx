import {
  adaptReservation,
  adaptStats,
} from "@/app/dashboard/reservas/lib/adapter"
import ReservationHeader from "@/app/dashboard/reservas/components/layout/ReservationHeader"
import ReservationStats from "@/app/dashboard/reservas/components/layout/ReservationStats"
import ReservationList from "@/app/dashboard/reservas/components/layout/ReservationList"
import {
  getReservationStats,
  getReservationsWithPaymentStatus,
  listReservations,
} from "@/services/reservations"

export const metadata = {
  title: "Reservas · PickyRentCar",
}

export default async function ReservationsPage() {
  const [reservations, stats, paidReservationIds] = await Promise.all([
    listReservations(),
    getReservationStats(),
    getReservationsWithPaymentStatus(),
  ])

  const adaptedReservations = reservations.map(adaptReservation)
  const adaptedStats = adaptStats(stats)

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <ReservationHeader />
      <ReservationStats stats={adaptedStats} />
      <ReservationList
        reservations={adaptedReservations}
        paidReservationIds={paidReservationIds}
      />
    </div>
  )
}