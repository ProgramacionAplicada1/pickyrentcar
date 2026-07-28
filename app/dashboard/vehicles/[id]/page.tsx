import Link from "next/link"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Car01Icon,
  ColorPickerIcon,
  Dollar01Icon,
  Edit01Icon,
  FuelIcon,
  LicenseIcon,
  Note01Icon,
  Settings01Icon,
  TagIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StatusBadge } from "@/components/vehicles/status-badge"
import { DeleteVehicleButton } from "@/components/vehicles/vehicle-actions"
import { ImageGalleryDialog } from "@/components/vehicles/image-gallery-dialog"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { getVehicleById } from "@/services/vehicles"

export const metadata = {
  title: "Vehículo · PickyRentCar",
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function VehicleDetailPage({ params }: Props) {
  const { id } = await params
  const vehicle = await getVehicleById(id)
  if (!vehicle) notFound()

  const cover = vehicle.image_urls[0] ?? null

  const created = new Date(vehicle.created_at).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const updated = new Date(vehicle.updated_at).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit rounded-full"
        nativeButton={false}
        render={<Link href="/dashboard/vehicles" />}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.75} />
        Volver a vehículos
      </Button>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
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
            {vehicle.image_urls.length > 0 && (
              <span className="absolute top-3 right-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
                {vehicle.image_urls.length} foto
                {vehicle.image_urls.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <CardHeader className="gap-3 p-6 pb-3">
            <div className="flex items-center gap-2">
              <CardDescription className="text-xs font-semibold tracking-wider uppercase">
                {vehicle.year}
              </CardDescription>
              <StatusBadge status={vehicle.status} />
            </div>
            <CardTitle className="text-2xl">
              {vehicle.brand} {vehicle.model}
            </CardTitle>
            {vehicle.nombre && (
              <p className="text-sm font-medium text-primary italic">
                &ldquo;{vehicle.nombre}&rdquo;
              </p>
            )}
            <p className="font-mono text-lg font-semibold tracking-wider">
              {vehicle.plate}
            </p>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 px-6 pb-6">
            <DetailRow
              icon={<HugeiconsIcon icon={TagIcon} strokeWidth={1.5} />}
              label="Categoría"
              value={vehicle.category}
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
              icon={<HugeiconsIcon icon={Dollar01Icon} strokeWidth={1.5} />}
              label="Precio por día"
              value={formatCurrency(Number(vehicle.daily_price))}
            />
            {vehicle.notes && (
              <DetailRow
                icon={<HugeiconsIcon icon={Note01Icon} strokeWidth={1.5} />}
                label="Notas"
                value={vehicle.notes}
                multiline
              />
            )}

            {vehicle.image_urls.length > 0 && (
              <div className="mt-3 flex flex-col gap-2 border-t pt-4">
                <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                  Galería
                </p>
                <ImageGalleryDialog
                  images={vehicle.image_urls}
                  vehicleLabel={`${vehicle.brand} ${vehicle.model}`}
                />
              </div>
            )}

            <div className="mt-2 flex flex-col gap-1 border-t pt-4 text-xs text-muted-foreground">
              <p>
                <span className="font-medium text-foreground/70">Creado:</span>{" "}
                {created}
              </p>
              <p>
                <span className="font-medium text-foreground/70">
                  Actualizado:
                </span>{" "}
                {updated}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full"
            nativeButton={false}
            render={
              <Link href={`/dashboard/vehicles/${vehicle.id}/edit`} />
            }
          >
            <HugeiconsIcon icon={Edit01Icon} strokeWidth={1.75} />
            Editar
          </Button>
          <DeleteVehicleButton
            plate={vehicle.plate}
            vehicleId={vehicle.id}
          />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <HugeiconsIcon
            icon={LicenseIcon}
            strokeWidth={1.75}
            className="size-3"
          />
          <span>ID interno: {vehicle.id.slice(0, 8)}…</span>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
  multiline,
}: {
  icon: React.ReactNode
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground [&_svg]:size-[18px]">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {label}
        </p>
        <p
          className={
            multiline
              ? "text-sm leading-relaxed text-foreground"
              : "text-sm text-foreground"
          }
        >
          {value}
        </p>
      </div>
    </div>
  )
}