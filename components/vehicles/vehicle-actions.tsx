"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { DeleteVehicleDialog } from "@/components/vehicles/delete-vehicle-dialog"

type Props = {
  plate: string
  vehicleId: string
  redirectTo?: string
}

export function DeleteVehicleButton({
  plate,
  vehicleId,
  redirectTo = "/dashboard/vehicles",
}: Props) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="lg"
        className="rounded-full"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.75} />
        Eliminar
      </Button>
      <DeleteVehicleDialog
        plate={plate}
        vehicleId={vehicleId}
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) {
            router.push(redirectTo)
          }
        }}
      />
    </>
  )
}
