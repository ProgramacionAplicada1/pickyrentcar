"use client"

import Link from "next/link"
import { FiArrowRight, FiDroplet, FiSettings, FiUsers } from "react-icons/fi"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FavoriteButton } from "@/components/public/favorite-button"
import { HoverImageCarousel } from "@/components/vehicles/hover-image-carousel"
import { formatCurrency } from "@/lib/utils/formatCurrency"

type PublicVehicle = {
  id: string
  nombre: string | null
  plate: string
  brand: string
  model: string
  year: number
  seats: number | null
  status: string
  transmission: string
  fuel_type: string
  category: string
  daily_price: number
  image_urls: string[]
}

type Props = {
  vehicle: PublicVehicle
  userId?: string | null
  initialFavorite?: boolean
  detailHref?: string
  showFavorite?: boolean
}

export function CatalogVehicleCard({
  vehicle,
  userId,
  initialFavorite = false,
  detailHref,
  showFavorite = true,
}: Props) {
  const href = detailHref ?? `/catalogo/${vehicle.id}`

  
  const normalizedStatus = String(vehicle.status).toLowerCase().trim()
  
  let badgeText = "Disponible"
  let badgeClasses = "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"

  if (normalizedStatus === "in_use" || normalizedStatus === "uso") {
    badgeText = "En uso"
    badgeClasses = "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
  } else if (normalizedStatus === "maintenance" || normalizedStatus === "mantenimiento") {
    badgeText = "Mantenimiento"
    badgeClasses = "border-red-200 bg-red-50 text-red-700 hover:bg-red-50 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
  }

  return (
    <Card className="group gap-0 overflow-hidden rounded-2xl p-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        <HoverImageCarousel
          images={vehicle.image_urls}
          alt={`${vehicle.brand} ${vehicle.model}`}
          zoomOnHover
          topRight={
            <div className="flex items-center gap-2">
              {vehicle.image_urls.length > 1 && (
                <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur">
                  {vehicle.image_urls.length} fotos
                </span>
              )}
              {showFavorite && (
                <FavoriteButton
                  vehicleId={vehicle.id}
                  userId={userId}
                  initialFavorite={initialFavorite}
                />
              )}
            </div>
          }
        />

       
        <Badge className={`absolute top-3 left-3 border shadow-sm ${badgeClasses}`}>
          {badgeText}
        </Badge>
      </div>

      <CardHeader className="gap-1.5 p-4 pb-2">
        <CardDescription className="text-xs font-semibold tracking-wide uppercase">
          {vehicle.category} · {vehicle.year}
        </CardDescription>
        <CardTitle className="text-lg leading-tight">
          {vehicle.brand} {vehicle.model}
        </CardTitle>
        {vehicle.nombre && (
          <p className="line-clamp-1 text-xs font-medium text-primary italic">
            &ldquo;{vehicle.nombre}&rdquo;
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 p-4 pt-1">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <FiSettings className="size-3.5" />
            {vehicle.transmission}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <FiDroplet className="size-3.5" />
            {vehicle.fuel_type}
          </span>
          {vehicle.seats && (
            <span className="inline-flex items-center gap-1.5">
              <FiUsers className="size-3.5" />
              {vehicle.seats} pasajeros
            </span>
          )}
        </div>

        <div className="mt-auto border-t pt-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                Desde
              </span>
              <div className="mt-0.5 text-xl font-bold tracking-tight">
                {formatCurrency(Number(vehicle.daily_price))}
                <span className="ml-1 text-xs font-medium text-muted-foreground">
                  / día
                </span>
              </div>
            </div>

            <Button
              variant="default"
              size="sm"
              className="rounded-full"
              nativeButton={false}
              render={<Link href={href} />}
            >
              Ver vehículo
              <FiArrowRight />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}