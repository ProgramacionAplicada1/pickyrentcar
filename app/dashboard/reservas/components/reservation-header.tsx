import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CalendarCheckOut01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

export function ReservationHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <HugeiconsIcon
            icon={CalendarCheckOut01Icon}
            strokeWidth={1.75}
            className="size-3.5 text-primary"
          />
          Centro de reservas
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Reservas
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Gestiona las reservas de tus vehículos. Cada reserva creada desde el
            catálogo público aparece aquí filtrada por tus vehículos.
          </p>
        </div>
      </div>
      <Button
        variant="default"
        size="default"
        className="rounded-full"
        nativeButton={false}
        render={<Link href="/catalogo" target="_blank" />}
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
        Ver catálogo público
      </Button>
    </div>
  )
}