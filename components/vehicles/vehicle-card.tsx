"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Car01Icon } from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { StatusBadge } from "@/components/vehicles/status-badge"
import { DeleteVehicleDialog } from "@/components/vehicles/delete-vehicle-dialog"
import {
  type VehicleRow,
  getCoverUrl,
} from "@/components/vehicles/vehicle-row"

export type { VehicleRow } from "@/components/vehicles/vehicle-row"

type Props = {
  vehicle: VehicleRow
}

export function VehicleCard({ vehicle }: Props) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const cover = getCoverUrl(vehicle)

  return (
    <Card className="relative gap-0 overflow-hidden rounded-2xl p-0 transition-shadow hover:shadow-md">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Acciones del vehículo ${vehicle.plate}`}
              className="absolute top-2 right-2 z-10 size-8 rounded-full bg-card/80 text-foreground backdrop-blur"
            />
          }
        >
          <CardActionsIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={
              <Link href={`/dashboard/vehicles/${vehicle.id}`} />
            }
          >
            Ver detalle
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <Link href={`/dashboard/vehicles/${vehicle.id}/edit`} />
            }
          >
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDialogOpen(true)}
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <HugeiconsIcon
              icon={Car01Icon}
              strokeWidth={1.5}
              className="size-12 text-muted-foreground/40"
            />
          </div>
        )}
        {vehicle.image_urls.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur">
            +{vehicle.image_urls.length - 1}
          </span>
        )}
      </div>

      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {vehicle.year}
          </p>
          <StatusBadge status={vehicle.status} />
        </div>
        <p className="text-base font-semibold leading-tight">
          {vehicle.brand} {vehicle.model}
        </p>
        {vehicle.nombre && (
          <p className="text-xs font-medium text-primary italic">
            &ldquo;{vehicle.nombre}&rdquo;
          </p>
        )}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="font-mono font-medium tracking-wide">
            {vehicle.plate}
          </span>
          <span>{vehicle.seats ?? 5} asientos</span>
        </div>
      </CardContent>

      <DeleteVehicleDialog
        plate={vehicle.plate}
        vehicleId={vehicle.id}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  )
}

function CardActionsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}