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
import { listPagos } from "@/services/payments"
import type { ReservationPaymentInfo } from "@/app/dashboard/reservas/lib/adapter"

export const metadata = {
  title: "Reservas · PickyRentCar",
}

export default async function ReservationsPage() {
  const [reservations, stats, paidReservationIds, pagos] = await Promise.all([
    listReservations(),
    getReservationStats(),
    getReservationsWithPaymentStatus(),
    listPagos(),
  ])

  // listPagos viene ordenado del más reciente al más antiguo.
  const latestPaymentByReservation = new Map<string, ReservationPaymentInfo>()
  for (const pago of pagos) {
    if (!latestPaymentByReservation.has(pago.reservation_id)) {
      latestPaymentByReservation.set(pago.reservation_id, pago)
    }
  }

  const adaptedReservations = reservations.map((row) =>
    adaptReservation(row, latestPaymentByReservation.get(row.id)),
  )
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