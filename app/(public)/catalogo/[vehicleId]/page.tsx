import Link from "next/link"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Calendar01Icon,
  Car01Icon,
  CheckmarkCircle02Icon,
  ColorPickerIcon,
  FuelIcon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ImageGalleryDialog } from "@/components/vehicles/image-gallery-dialog"
import { ReservationForm } from "@/components/public/reservation-form"
import { VehicleAvailabilityPicker } from "@/components/public/vehicle-availability-picker"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import {
  getPublicVehicleById,
  getVehicleReservedRanges,
} from "@/services/catalog"

export const metadata = {
  title: "Detalle del vehículo · PickyRentCar",
}

type Props = {
  params: Promise<{ vehicleId: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}

export default async function CatalogoVehiclePage({
  params,
  searchParams,
}: Props) {
  const { vehicleId } = await params
  const { from, to } = await searchParams

  const vehicle = await getPublicVehicleById(vehicleId)
  if (!vehicle) notFound()

  const disabledRanges = await getVehicleReservedRanges(vehicleId)

  const isUnavailable = vehicle.status === "maintenance"
  const cover = vehicle.image_urls[0] ?? null

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit rounded-full"
        nativeButton={false}
        render={<Link href="/catalogo" />}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.75} />
        Volver al catálogo
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card className="gap-0 overflow-hidden rounded-2xl p-0">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={`${vehicle.brand} ${vehicle.model}`}
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

            <CardHeader className="gap-2 p-6 pb-3">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {vehicle.category} · {vehicle.year}
              </p>
              <CardTitle className="text-2xl sm:text-3xl">
                {vehicle.brand} {vehicle.model}
              </CardTitle>
              {vehicle.nombre && (
                <p className="text-base font-medium text-primary italic">
                  &ldquo;{vehicle.nombre}&rdquo;
                </p>
              )}
              <p className="font-mono text-base font-semibold tracking-wider text-muted-foreground">
                {vehicle.plate}
              </p>
            </CardHeader>

            <CardContent className="grid gap-3 px-6 pb-6 sm:grid-cols-2">
              <DetailRow
                icon={<HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} />}
                label="Transmisión"
                value={vehicle.transmission}
              />
              <DetailRow
                icon={<HugeiconsIcon icon={FuelIcon} strokeWidth={1.5} />}
                label="Combustible"
                value={vehicle.fuel_type}
              />
              <DetailRow
                icon={<HugeiconsIcon icon={ColorPickerIcon} strokeWidth={1.5} />}
                label="Color"
                value={vehicle.color ?? "—"}
              />
              <DetailRow
                icon={<HugeiconsIcon icon={UserIcon} strokeWidth={1.5} />}
                label="Asientos"
                value={vehicle.seats?.toString() ?? "—"}
              />
            </CardContent>
          </Card>

          {vehicle.image_urls.length > 0 && (
            <Card className="gap-4 rounded-2xl p-6">
              <CardTitle className="text-base">Galería</CardTitle>
              <ImageGalleryDialog
                images={vehicle.image_urls}
                vehicleLabel={`${vehicle.brand} ${vehicle.model}`}
              />
            </Card>
          )}

          <Card className="gap-4 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Disponibilidad</CardTitle>
              <Badge variant={isUnavailable ? "destructive" : "secondary"}>
                {isUnavailable
                  ? "En mantenimiento"
                  : "Disponible para reservar"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Selecciona el rango de fechas en el calendario. Las fechas en
              gris ya están reservadas o son pasadas.
            </p>
            <VehicleAvailabilityPicker
              vehicleId={vehicle.id}
              disabledRanges={disabledRanges}
            />
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="gap-6 rounded-2xl p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Tarifa
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tracking-tight">
                  {formatCurrency(Number(vehicle.daily_price))}
                </span>
                <span className="text-sm text-muted-foreground">/ día</span>
              </div>
            </div>

            <Separator />

            {isUnavailable ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <HugeiconsIcon
                  icon={Car01Icon}
                  strokeWidth={1.5}
                  className="size-10 text-destructive/70"
                />
                <p className="text-sm text-foreground">
                  Este vehículo no está disponible para reservas en este momento.
                </p>
              </div>
            ) : !from || !to ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border bg-muted/30 p-6 text-center">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  strokeWidth={1.5}
                  className="size-10 text-muted-foreground/60"
                />
                <p className="text-sm text-foreground">
                  Selecciona las fechas en el calendario para ver el precio
                  total y continuar con la reserva.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl border bg-muted/30 p-3 text-sm">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  strokeWidth={2}
                  className="size-5 text-primary"
                />
                <span>
                  Rango seleccionado: <strong>{from}</strong> →{" "}
                  <strong>{to}</strong>
                </span>
              </div>
            )}

            {!isUnavailable && from && to && (
              <ReservationForm
                vehicleId={vehicle.id}
                vehicleLabel={`${vehicle.brand} ${vehicle.model}`}
                dailyPrice={Number(vehicle.daily_price)}
                initialStartDate={from}
                initialEndDate={to}
              />
            )}
          </Card>
        </aside>
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border bg-muted/20 p-3">
      <div className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground [&_svg]:size-[18px]">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}