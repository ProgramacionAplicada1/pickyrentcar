"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Car01Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HoverImageCarousel } from "@/components/vehicles/hover-image-carousel"
import { formatCurrency } from "@/lib/utils/formatCurrency"

type PublicVehicle = {
  id: string
  nombre: string | null
  plate: string
  brand: string
  model: string
  year: number
  status: string
  transmission: string
  fuel_type: string
  category: string
  daily_price: number
  image_urls: string[]
}

type Props = {
  vehicle: PublicVehicle
}

export function CatalogVehicleCard({ vehicle }: Props) {
  return (
    <Card className="group gap-0 overflow-hidden rounded-2xl p-0 transition-shadow hover:shadow-md">
      <HoverImageCarousel
        images={vehicle.image_urls}
        alt={`${vehicle.brand} ${vehicle.model}`}
        photosBadge
      />

      <CardHeader className="gap-1.5 p-4 pb-2">
        <CardDescription className="text-xs font-semibold tracking-wide uppercase">
          {vehicle.category} · {vehicle.year}
        </CardDescription>
        <CardTitle className="text-base">
          {vehicle.brand} {vehicle.model}
        </CardTitle>
        {vehicle.nombre && (
          <p className="text-xs font-medium text-primary italic">
            &ldquo;{vehicle.nombre}&rdquo;
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-4 pt-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{vehicle.transmission}</Badge>
          <Badge variant="secondary">{vehicle.fuel_type}</Badge>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
              Desde
            </span>
            <span className="text-lg font-bold tracking-tight">
              {formatCurrency(Number(vehicle.daily_price))}
              <span className="text-xs font-medium text-muted-foreground">
                {" "}
                / día
              </span>
            </span>
          </div>
          <Button
            variant="default"
            size="sm"
            className="rounded-full"
            nativeButton={false}
            render={<Link href={`/catalogo/${vehicle.id}`} />}
          >
            Ver detalle
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}