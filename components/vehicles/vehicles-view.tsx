"use client"

import { VehiclesGrid } from "@/components/vehicles/vehicles-grid"
import { VehiclesTable } from "@/components/vehicles/vehicles-table"
import type { VehicleRow } from "@/components/vehicles/vehicle-card"

type Props = {
  view: "grid" | "table"
  vehicles: VehicleRow[]
}

export function VehiclesView({ view, vehicles }: Props) {
  if (view === "table") {
    return <VehiclesTable vehicles={vehicles} />
  }
  return <VehiclesGrid vehicles={vehicles} />
}
