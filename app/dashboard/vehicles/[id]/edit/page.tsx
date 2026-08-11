import { notFound } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VehicleForm } from "@/components/vehicles/vehicle-form"
import { BackButton } from "@/components/vehicles/back-button"
import type { VehicleFormData } from "@/app/dashboard/vehicles/validations"
import { getVehicleById } from "@/services/vehicles"

export const metadata = {
  title: "Editar vehículo · PickyRentCar",
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditVehiclePage({ params }: Props) {
  const { id } = await params
  const vehicle = await getVehicleById(id)
  if (!vehicle) notFound()

  const initialData: VehicleFormData = {
    nombre: vehicle.nombre,
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    seats: vehicle.seats ?? 5,
    status: (vehicle.status as VehicleFormData["status"]) ?? "available",
    transmission: vehicle.transmission,
    fuel_type: vehicle.fuel_type,
    category: vehicle.category,
    daily_price: Number(vehicle.daily_price),
    notes: vehicle.notes,
    image_urls: vehicle.image_urls,
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <BackButton />

      <div className="mx-auto w-full max-w-2xl">
        <Card className="gap-5 rounded-2xl p-5">
          <CardHeader className="p-0">
            <CardTitle className="text-xl">Editar vehículo</CardTitle>
            <CardDescription>
              Modifica los datos del vehículo{" "}
              <span className="font-semibold tracking-wider text-foreground">
                {vehicle.plate}
              </span>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <VehicleForm
              mode="edit"
              vehicleId={vehicle.id}
              initialData={initialData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}