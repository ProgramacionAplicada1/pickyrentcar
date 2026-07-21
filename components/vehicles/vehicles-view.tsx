"use client"

import {
  VehiclesGrid,
  type VehicleRow,
} from "@/components/vehicles/vehicles-grid"
import {
  VehiclesTable,
  type VehicleRow as VehicleRowTable,
} from "@/components/vehicles/vehicles-table"

type Props = {
  view: "grid" | "table"
  vehicles: VehicleRow[]
}

export function VehiclesView({ view, vehicles }: Props) {
  if (view === "table") {
    return <VehiclesTable vehicles={vehicles as VehicleRowTable[]} />
  }
  return <VehiclesGrid vehicles={vehicles} />
}
