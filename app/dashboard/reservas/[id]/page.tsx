import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Car01Icon,
  Dollar01Icon,
  Mail01Icon,
  TelephoneIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BackButton } from "@/components/ui/back-button"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/vehicles/status-badge"
import { ReservationStatusActions } from "../components/reservation-status-actions"
import { ReservationStatusBadge } from "../components/reservation-status-badge"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { getReservationById, getReservationsWithPaymentStatus} from "@/services/reservations";



export const metadata = {
  title: "Detalle de reserva · PickyRentCar",
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function ReservationDetailPage({ params }: Props) {
  const { id } = await params
  const reservation = await getReservationById(id)
  if (!reservation) notFound()
  
  const paidReservationIds = await getReservationsWithPaymentStatus();
  const hasCompletedPayment = paidReservationIds.has(reservation.id);

  const cover = reservation.vehicle?.image_urls[0] ?? null

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <BackButton
        fallbackHref="/dashboard/reservas"
        label="Volver a reservas"
        className="w-fit rounded-full"
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Card className="gap-0 overflow-hidden rounded-2xl p-0">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={`${reservation.vehicle?.brand} ${reservation.vehicle?.model}`}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <HugeiconsIcon
                  icon={Car01Icon}
                  strokeWidth={1.5}
                  className="size-16 text-muted-foreground/40"
                />
              </div>
            )}
          </div>

          <CardHeader className="gap-3 p-6 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">
                {reservation.numero}
              </p>
              <ReservationStatusBadge status={reservation.status} />
              {reservation.vehicle?.status && (
                <StatusBadge status={reservation.vehicle.status} />
              )}
            </div>
            <CardTitle className="text-2xl">
              {reservation.vehicle?.brand} {reservation.vehicle?.model}{" "}
              <span className="text-base font-normal text-muted-foreground">
                ({reservation.vehicle?.year})
              </span>
            </CardTitle>
            {reservation.vehicle?.nombre && (
              <p className="text-sm font-medium text-primary italic">
                &ldquo;{reservation.vehicle.nombre}&rdquo;
              </p>
            )}
            <p className="font-mono text-sm tracking-wider text-muted-foreground">
              {reservation.vehicle?.plate}
            </p>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 px-6 pb-6">
            <section className="flex flex-col gap-3">
              <SectionTitle icon={UserIcon} label="Cliente" />
              <div className="grid gap-3 sm:grid-cols-2">
                <DataLine
                  icon={UserIcon}
                  label="Nombre"
                  value={reservation.client_name}
                />
                {reservation.client_email && (
                  <DataLine
                    icon={Mail01Icon}
                    label="Correo"
                    value={reservation.client_email}
                  />
                )}
                <DataLine
                  icon={TelephoneIcon}
                  label="Teléfono"
                  value={reservation.client_phone}
                />
              </div>
            </section>

            <Separator />

            <section className="flex flex-col gap-3">
              <SectionTitle icon={Calendar01Icon} label="Fechas" />
              <div className="grid gap-3 sm:grid-cols-3">
                <DataLine
                  icon={Calendar01Icon}
                  label="Inicio"
                  value={formatLong(reservation.start_date)}
                />
                <DataLine
                  icon={Calendar01Icon}
                  label="Fin"
                  value={formatLong(reservation.end_date)}
                />
                <DataLine
                  icon={Calendar01Icon}
                  label="Duración"
                  value={`${reservation.days} ${reservation.days === 1 ? "día" : "días"}`}
                />
              </div>
            </section>

            <Separator />

            <section className="flex flex-col gap-3">
              <SectionTitle icon={Dollar01Icon} label="Pago" />
              <div className="grid gap-3 sm:grid-cols-3">
                <DataLine
                  icon={Dollar01Icon}
                  label="Tarifa diaria"
                  value={formatCurrency(reservation.daily_price)}
                />
                <DataLine
                  icon={Dollar01Icon}
                  label="Total"
                  value={formatCurrency(reservation.total_price)}
                />
                <DataLine
                  icon={Dollar01Icon}
                  label="Estado"
                  value="Pendiente de pago"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                El registro del pago del anticipo se habilitará en una próxima
                iteración.
              </p>
            </section>

            {reservation.notes && (
              <>
                <Separator />
                <section className="flex flex-col gap-3">
                  <SectionTitle icon={Calendar01Icon} label="Notas" />
                  <p className="rounded-2xl border bg-muted/30 p-3 text-sm leading-relaxed text-foreground">
                    {reservation.notes}
                  </p>
                </section>
              </>
            )}

            <Separator />

            <section className="flex flex-col gap-3">
              <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                Acciones
              </p>
              <ReservationStatusActions
                reservationId={reservation.id}
                status={reservation.status}
                hasCompletedPayment={hasCompletedPayment}
              />
            </section>

            <Separator />

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground/70">Creada:</span>{" "}
                {formatDateTime(reservation.created_at)}
              </p>
              <p>
                <span className="font-medium text-foreground/70">
                  Última actualización:
                </span>{" "}
                {formatDateTime(reservation.updated_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
}) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
      <HugeiconsIcon icon={Icon} strokeWidth={1.75} className="size-3.5" />
      {label}
    </p>
  )
}

function DataLine({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border bg-muted/20 p-3">
      <div className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground [&_svg]:size-3.5">
        <HugeiconsIcon icon={Icon} strokeWidth={1.75} />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {label}
        </span>
        <span className="truncate text-sm font-medium">{value}</span>
      </div>
    </div>
  )
}

function formatLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}