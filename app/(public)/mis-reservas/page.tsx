import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiMapPin,
} from "react-icons/fi"
import { FaCarSide } from "react-icons/fa"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MyReservationStatus } from "@/components/public/my-reservation-status"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { getCurrentUser } from "@/services/auth"
import { listMyReservations } from "@/services/my-reservations"

export const metadata: Metadata = {
  title: "Mis reservas · PickyRentCar",
  description: "Consulta el estado y los detalles de tus reservas.",
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseDateOnly(value))
}

export default async function MyReservationsPage() {
  const user = await getCurrentUser()

  if (!user) redirect("/login?next=/mis-reservas")
  if (user.role === "admin") redirect("/dashboard")

  const reservations = await listMyReservations()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = reservations.filter(
    (reservation) =>
      !["cancelada", "finalizada"].includes(reservation.status) &&
      parseDateOnly(reservation.end_date) >= today,
  ).length

  const active = reservations.filter(
    (reservation) => reservation.status === "activa",
  ).length

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-primary">Tu cuenta</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Mis reservas
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Consulta tus próximas rentas, reservas activas y el historial de
          vehículos que has reservado con PickyRentCar.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Reservas totales" value={reservations.length} />
        <SummaryCard label="Próximas" value={upcoming} />
        <SummaryCard label="Activas" value={active} />
      </div>

      {reservations.length === 0 ? (
        <Card className="rounded-3xl border-dashed py-12">
          <CardContent className="flex flex-col items-center gap-4 px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FaCarSide className="size-6" />
            </div>
            <div className="flex max-w-md flex-col gap-1.5">
              <h2 className="text-lg font-semibold">Aún no tienes reservas</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Cuando reserves un vehículo usando esta cuenta, aparecerá aquí
                junto con su estado y todos los detalles de la renta.
              </p>
            </div>
            <Button
              className="mt-1 rounded-full"
              nativeButton={false}
              render={<Link href="/catalogo" />}
            >
              Explorar vehículos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => {
            const vehicle = reservation.vehicle
            const image = vehicle?.image_urls[0]

            return (
              <Card
                key={reservation.id}
                className="overflow-hidden rounded-3xl p-0 transition-shadow hover:shadow-md"
              >
                <div className="grid md:grid-cols-[220px_1fr]">
                  <div className="relative min-h-48 bg-muted md:min-h-full">
                    {image ? (
                      <Image
                        src={image}
                        alt={
                          vehicle
                            ? `${vehicle.brand} ${vehicle.model}`
                            : "Vehículo reservado"
                        }
                        fill
                        sizes="(max-width: 768px) 100vw, 220px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60">
                        <FaCarSide className="size-12" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <p className="mb-1 font-mono text-xs font-semibold tracking-wider text-muted-foreground">
                          {reservation.numero}
                        </p>
                        <h2 className="truncate text-xl font-semibold tracking-tight">
                          {vehicle
                            ? `${vehicle.brand} ${vehicle.model}`
                            : "Vehículo reservado"}
                        </h2>
                        {vehicle && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {vehicle.category} · {vehicle.year} · {vehicle.transmission}
                          </p>
                        )}
                      </div>
                      <MyReservationStatus status={reservation.status} />
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                      <InfoItem
                        icon={<FiCalendar />}
                        label="Periodo"
                        value={`${formatDate(reservation.start_date)} – ${formatDate(
                          reservation.end_date,
                        )}`}
                      />
                      <InfoItem
                        icon={<FiClock />}
                        label="Duración"
                        value={`${reservation.days} ${reservation.days === 1 ? "día" : "días"}`}
                      />
                      <InfoItem
                        icon={<FiMapPin />}
                        label="Lugar"
                        value={reservation.location || "Por coordinar"}
                      />
                    </div>

                    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Total de la reserva
                        </p>
                        <p className="text-xl font-bold">
                          {formatCurrency(reservation.total_price)}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        className="rounded-full sm:self-end"
                        nativeButton={false}
                        render={<Link href={`/mis-reservas/${reservation.id}`} />}
                      >
                        Ver detalles
                        <FiArrowRight />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-2xl py-4">
      <CardContent className="flex items-center justify-between px-5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-2xl font-bold tracking-tight">{value}</span>
      </CardContent>
    </Card>
  )
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-3">
      <div className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium leading-5">{value}</p>
      </div>
    </div>
  )
}
