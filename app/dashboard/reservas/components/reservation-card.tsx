import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Calendar01Icon,
  Car01Icon,
  Dollar01Icon,
  Mail01Icon,
  TelephoneIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { ReservationStatusBadge } from "@/app/dashboard/reservas/components/reservation-status-badge"

export type ReservationRow = {
  id: string
  numero: string
  client_name: string
  client_email: string | null
  client_phone: string
  start_date: string
  end_date: string
  days: number
  total_price: number
  status: string
  vehicle: {
    id: string
    brand: string
    model: string
    year: number
    plate: string
    image_urls: string[]
    nombre: string | null
  }
}

type Props = {
  reservation: ReservationRow
}

export function ReservationCard({ reservation }: Props) {
  const cover = reservation.vehicle.image_urls[0] ?? null

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl p-0 transition-shadow hover:shadow-md">
      <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted sm:aspect-auto">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={`${reservation.vehicle.brand} ${reservation.vehicle.model}`}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <HugeiconsIcon
                icon={Car01Icon}
                strokeWidth={1.5}
                className="size-10 text-muted-foreground/40"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <CardHeader className="gap-2 p-4 pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-xs font-semibold tracking-wider text-muted-foreground">
                  {reservation.numero}
                </p>
                <p className="text-base font-semibold">
                  {reservation.vehicle.brand} {reservation.vehicle.model}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({reservation.vehicle.year})
                  </span>
                </p>
                {reservation.vehicle.nombre && (
                  <p className="text-xs font-medium text-primary italic">
                    &ldquo;{reservation.vehicle.nombre}&rdquo;
                  </p>
                )}
                <p className="font-mono text-xs tracking-wider text-muted-foreground">
                  {reservation.vehicle.plate}
                </p>
              </div>
              <ReservationStatusBadge status={reservation.status} />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 px-4 py-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <DataLine
                icon={UserIcon}
                label="Cliente"
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
              <DataLine
                icon={Calendar01Icon}
                label="Fechas"
                value={`${formatShort(reservation.start_date)} → ${formatShort(reservation.end_date)} · ${reservation.days} ${reservation.days === 1 ? "día" : "días"}`}
              />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-2xl border bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <HugeiconsIcon
                  icon={Dollar01Icon}
                  strokeWidth={1.75}
                  className="size-4 text-muted-foreground"
                />
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">
                  {formatCurrency(Number(reservation.total_price))}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-end p-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              nativeButton={false}
              render={<Link href={`/dashboard/reservas/${reservation.id}`} />}
            >
              Ver detalle
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={1.75}
                className="size-4"
              />
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
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
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-3.5">
        <HugeiconsIcon icon={Icon} strokeWidth={1.75} />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {label}
        </span>
        <span className="truncate text-sm">{value}</span>
      </div>
    </div>
  )
}

function formatShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}