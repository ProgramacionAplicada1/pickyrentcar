"use client"

import { VehicleCard } from "@/components/vehicles/vehicle-card"
import type { VehicleRow } from "@/components/vehicles/vehicle-row"

type Props = {
  vehicles: VehicleRow[]
}

export function VehiclesGrid({ vehicles }: Props) {
  return (
    <div className="group/grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  )
}
