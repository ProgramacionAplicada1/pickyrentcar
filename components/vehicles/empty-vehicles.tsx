import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Car01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function EmptyVehicles() {
  return (
    <Empty className="rounded-2xl border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={Car01Icon} strokeWidth={1.75} />
        </EmptyMedia>
        <EmptyTitle>Aún no hay vehículos</EmptyTitle>
        <EmptyDescription>
          Empieza creando el primer vehículo para gestionar tu flota.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="default"
          size="lg"
          className="rounded-full"
          nativeButton={false}
          render={<Link href="/dashboard/vehicles/new" />}
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
          Crear primer vehículo
        </Button>
      </EmptyContent>
    </Empty>
  )
}