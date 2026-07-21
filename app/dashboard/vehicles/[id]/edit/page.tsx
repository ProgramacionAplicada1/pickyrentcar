import Link from "next/link"
import { notFound, redirect } from "next/navigation"
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
import type { VehicleFormData } from "@/app/dashboard/vehicles/validations"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Editar vehículo · PickyRentCar",
}

type Props = {
  params: Promise<{ id: string }>
}

type VehicleRow = {
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
}

export default async function EditVehiclePage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data } = await supabase
    .from("vehicles")
    .select(
      "id, plate, brand, model, year, color, seats, status, notes, image_url",
    )
    .eq("id", id)
    .maybeSingle()

  if (!data) notFound()
  const vehicle = data as VehicleRow

  const initialData: VehicleFormData = {
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    seats: vehicle.seats ?? 5,
    status: (vehicle.status as VehicleFormData["status"]) ?? "available",
    notes: vehicle.notes,
    image_url: vehicle.image_url,
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit rounded-full"
        nativeButton={false}
        render={<Link href={`/dashboard/vehicles/${vehicle.id}`} />}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.75} />
        Volver
      </Button>

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
