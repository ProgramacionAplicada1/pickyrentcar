"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { deleteVehicle } from "@/app/dashboard/vehicles/actions"

type Props = {
  plate: string
  vehicleId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteVehicleDialog({
  plate,
  vehicleId,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleDelete() {
    setIsPending(true)
    setError(null)
    const result = await deleteVehicle(vehicleId)
    setIsPending(false)
    if (result.ok) {
      onOpenChange(false)
      router.refresh()
    } else {
      setError(result.error ?? "No se pudo eliminar el vehículo.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar vehículo</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de eliminar el vehículo con placa{" "}
            <span className="font-semibold text-foreground">{plate}</span>? Esta
            acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancelar
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
