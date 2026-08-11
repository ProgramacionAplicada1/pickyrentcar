import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  FiArrowLeft,
  FiCalendar,
  FiTruck,
  FiClock,
  FiHash,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
} from "react-icons/fi"

import { MyReservationStatus } from "@/components/public/my-reservation-status"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { getCurrentUser } from "@/services/auth"
import { getMyReservationById } from "@/services/my-reservations"

export const metadata: Metadata = {
  title: "Detalle de reserva · PickyRentCar",
}

type Props = {
  params: Promise<{ id: string }>
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDateOnly(value))
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

const STATUS_COPY: Record<string, string> = {
  pendiente:
    "Recibimos tu solicitud. El equipo de PickyRentCar debe validar los próximos pasos antes de confirmarla.",
  pendiente_pago:
    "Tu reserva fue aceptada. Realiza el pago para activar tu reserva.",
  activa:
    "Tu renta esta activa actualmente. Si necesitas asistencia, contacta al equipo de PickyRentCar.",
  finalizada:
    "Esta renta ya fue finalizada y permanece disponible en tu historial.",
  cancelada: "Esta reserva fue cancelada y ya no está activa.",
};

export default async function MyReservationDetailPage({ params }: Props) {
  const user = await getCurrentUser()

  const { id } = await params

  if (!user) redirect(`/login?next=${encodeURIComponent(`/mis-reservas/${id}`)}`)
  if (user.role === "admin") redirect("/dashboard")
  const reservation = await getMyReservationById(id)

  if (!reservation) notFound()

  const vehicle = reservation.vehicle
  const image = vehicle?.image_urls[0]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <Button
          variant="ghost"
          className="-ml-3 rounded-full"
          nativeButton={false}
          render={<Link href="/mis-reservas" />}
        >
          <FiArrowLeft />
          Volver a mis reservas
        </Button>
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-sm font-semibold tracking-wider text-muted-foreground">
            {reservation.numero}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Detalle de tu reserva
          </h1>
          <p className="text-sm text-muted-foreground">
            Registrada el {formatCreatedAt(reservation.created_at)}
          </p>
        </div>
        <MyReservationStatus status={reservation.status} />
      </div>

      <div className="rounded-2xl border bg-muted/30 px-4 py-3 text-sm leading-6 text-muted-foreground">
        {STATUS_COPY[reservation.status] ??
          "Consulta aquí la información actualizada de tu reserva."}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden rounded-3xl p-0">
            <div className="grid sm:grid-cols-[220px_1fr]">
              <div className="relative min-h-52 bg-muted">
                {image ? (
                  <Image
                    src={image}
                    alt={
                      vehicle
                        ? `${vehicle.brand} ${vehicle.model}`
                        : "Vehículo reservado"
                    }
                    fill
                    sizes="(max-width: 640px) 100vw, 220px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60">
                    <FiTruck className="size-12" />
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center gap-4 p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Vehículo
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    {vehicle
                      ? `${vehicle.brand} ${vehicle.model}`
                      : "Vehículo reservado"}
                  </h2>
                  {vehicle?.nombre && (
                    <p className="mt-1 text-sm font-medium text-primary">
                      “{vehicle.nombre}”
                    </p>
                  )}
                </div>

                {vehicle && (
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border px-3 py-1">
                      {vehicle.year}
                    </span>
                    <span className="rounded-full border px-3 py-1">
                      {vehicle.category}
                    </span>
                    <span className="rounded-full border px-3 py-1">
                      {vehicle.transmission}
                    </span>
                    <span className="rounded-full border px-3 py-1">
                      {vehicle.fuel_type}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Datos de la renta</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                icon={<FiCalendar />}
                label="Recogida"
                value={formatDate(reservation.start_date)}
              />
              <DetailItem
                icon={<FiCalendar />}
                label="Devolución"
                value={formatDate(reservation.end_date)}
              />
              <DetailItem
                icon={<FiClock />}
                label="Duración"
                value={`${reservation.days} ${reservation.days === 1 ? "día" : "días"}`}
              />
              <DetailItem
                icon={<FiMapPin />}
                label="Lugar"
                value={reservation.location || "Por coordinar"}
              />
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Datos del titular</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <DetailItem
                icon={<FiUser />}
                label="Nombre"
                value={reservation.client_name}
              />
              <DetailItem
                icon={<FiMail />}
                label="Correo"
                value={reservation.client_email || "No indicado"}
              />
              <DetailItem
                icon={<FiPhone />}
                label="Teléfono"
                value={reservation.client_phone || "No indicado"}
              />
              <DetailItem
                icon={<FiHash />}
                label="Número de reserva"
                value={reservation.numero}
              />
            </CardContent>
          </Card>

          {reservation.notes && (
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Notas de la reserva</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {reservation.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Resumen de precio</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Tarifa diaria</span>
                <span className="font-medium">
                  {formatCurrency(reservation.daily_price)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">Días</span>
                <span className="font-medium">{reservation.days}</span>
              </div>
              <Separator />
              <div className="flex items-end justify-between gap-4">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold tracking-tight">
                  {formatCurrency(reservation.total_price)}
                </span>
              </div>

              <Button
                className="mt-2 rounded-full"
                nativeButton={false}
                render={<Link href="/catalogo" />}
              >
                Reservar otro vehículo
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border bg-muted/20 p-4">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground [&_svg]:size-4">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium leading-5">{value}</p>
      </div>
    </div>
  )
}
