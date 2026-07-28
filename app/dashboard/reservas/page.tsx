import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { CalendarCheckOut01Icon, Search01Icon } from "@hugeicons/core-free-icons"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

import { ReservationHeader } from "./components/reservation-header"
import { ReservationStats } from "./components/reservation-stats"
import { ReservationCard } from "./components/reservation-card"
import {
  getReservationStats,
  listReservations,
} from "@/services/reservations"

export const metadata = {
  title: "Reservas · PickyRentCar",
}

export default async function ReservationsPage() {
  const [reservations, stats] = await Promise.all([
    listReservations(),
    getReservationStats(),
  ])

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <ReservationHeader />

      <ReservationStats
        total={stats.total}
        activas={stats.activas}
        hoy={stats.hoy}
        facturado={stats.facturado}
      />

      {reservations.length === 0 ? (
        <Empty className="rounded-2xl border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon
                icon={CalendarCheckOut01Icon}
                strokeWidth={1.75}
              />
            </EmptyMedia>
            <EmptyTitle>Aún no tienes reservas</EmptyTitle>
            <EmptyDescription>
              Cuando un cliente reserve uno de tus vehículos desde el catálogo
              público, aparecerá aquí automáticamente.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="default"
              size="lg"
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/catalogo" target="_blank" />}
            >
              <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
              Ver catálogo público
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
            {reservations.length}{" "}
            {reservations.length === 1 ? "reserva" : "reservas"}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}