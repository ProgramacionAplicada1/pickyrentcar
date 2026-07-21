import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VehicleForm } from "@/components/vehicles/vehicle-form"

export const metadata = {
  title: "Crear vehículo · PickyRentCar",
}

export default function NewVehiclePage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          nativeButton={false}
          render={<Link href="/dashboard/vehicles" />}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.75} />
          Volver
        </Button>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <Card className="gap-5 rounded-2xl p-5">
          <CardHeader className="p-0">
            <CardTitle className="text-xl">Crear vehículo</CardTitle>
            <CardDescription>
              Registra un nuevo vehículo en la flota compartida de
              PickyRentCar.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <VehicleForm mode="create" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
