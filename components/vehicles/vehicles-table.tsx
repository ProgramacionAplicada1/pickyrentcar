"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Car01Icon } from "@hugeicons/core-free-icons"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

import { StatusBadge } from "@/components/vehicles/status-badge"
import { DeleteVehicleDialog } from "@/components/vehicles/delete-vehicle-dialog"

export type VehicleRow = {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color: string | null
  seats: number | null
  status: string
  notes: string | null
  image_url: string | null
  created_at: string
}

type Props = {
  vehicles: VehicleRow[]
}

export function VehiclesTable({ vehicles }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16"></TableHead>
            <TableHead>Placa</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead>Año</TableHead>
            <TableHead>Asientos</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-12 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <VehicleRow key={vehicle.id} vehicle={vehicle} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function VehicleRow({ vehicle }: { vehicle: VehicleRow }) {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  return (
    <TableRow>
      <TableCell>
        <Avatar size="default">
          {vehicle.image_url ? (
            <AvatarImage src={vehicle.image_url} alt={vehicle.plate} />
          ) : null}
          <AvatarFallback>
            <HugeiconsIcon
              icon={Car01Icon}
              strokeWidth={1.5}
              className="size-4"
            />
          </AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell className="font-semibold tracking-wide">
        {vehicle.plate}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {vehicle.brand} {vehicle.model}
          </span>
          {vehicle.color && (
            <span className="text-xs text-muted-foreground">
              {vehicle.color}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{vehicle.year}</TableCell>
      <TableCell className="text-muted-foreground">
        {vehicle.seats ?? "—"}
      </TableCell>
      <TableCell>
        <StatusBadge status={vehicle.status} />
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Acciones del vehículo ${vehicle.plate}`}
              />
            }
          >
            <RowActionsIcon />
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
        <DeleteVehicleDialog
          plate={vehicle.plate}
          vehicleId={vehicle.id}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </TableCell>
    </TableRow>
  )
}

function RowActionsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-muted-foreground"
    >
      <circle cx="5" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}
