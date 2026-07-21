import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { EmptyVehicles } from "@/components/vehicles/empty-vehicles"
import { VehiclesView } from "@/components/vehicles/vehicles-view"
import { ViewToggle, type VehicleView } from "@/components/vehicles/view-toggle"
import type { VehicleRow } from "@/components/vehicles/vehicle-card"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Vehículos · PickyRentCar",
}

type Props = {
  searchParams: Promise<{ view?: string }>
}

export default async function VehiclesPage({ searchParams }: Props) {
  const { view } = await searchParams
  const currentView: VehicleView = view === "table" ? "table" : "grid"

  const supabase = await createClient()
  const { data } = await supabase
    .from("vehicles")
    .select(
      "id, plate, brand, model, year, color, seats, status, notes, image_url, created_at",
    )
    .order("created_at", { ascending: false })

  const vehicles: VehicleRow[] = (data ?? []) as VehicleRow[]
  const isEmpty = vehicles.length === 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Administra tu flota de vehículos.
          <span className="block text-xs text-muted-foreground/70">
            {vehicles.length}{" "}
            {vehicles.length === 1
              ? "vehículo registrado"
              : "vehículos registrados"}
          </span>
        </p>
        <div className="flex items-center gap-2">
          <ViewToggle current={currentView} />
          <Button
            variant="default"
            size="default"
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/dashboard/vehicles/new" />}
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
            Crear vehículo
          </Button>
        </div>
      </div>

      {isEmpty ? (
        <EmptyVehicles />
      ) : (
        <VehiclesView view={currentView} vehicles={vehicles} />
      )}
    </div>
  )
}
