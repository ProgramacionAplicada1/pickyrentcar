import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Car01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function EmptyVehicles() {
  return (
    <Card className="gap-4 rounded-2xl p-10">
      <CardHeader className="items-center gap-2 p-0 text-center">
        <div className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HugeiconsIcon icon={Car01Icon} strokeWidth={1.75} className="size-6" />
        </div>
        <CardTitle>Aún no hay vehículos</CardTitle>
        <CardDescription>
          Empieza creando el primer vehículo para gestionar tu flota.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center p-0">
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
      </CardContent>
    </Card>
  )
}
