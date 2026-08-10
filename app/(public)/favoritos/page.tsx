import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { FiHeart } from "react-icons/fi"

import { CatalogVehicleCard } from "@/components/public/catalog-vehicle-card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getCurrentUser } from "@/services/auth"
import { listPublicVehicles } from "@/services/catalog"
import { getFavoriteVehicleIds } from "@/services/favorites"

export const metadata: Metadata = {
  title: "Favoritos",
  description: "Tus vehículos favoritos en PickyRentCar.",
}

export default async function FavoritosPage() {
  const user = await getCurrentUser()

  if (!user) redirect("/login?next=/favoritos")
  if (user.role === "admin") redirect("/catalogo")

  const [favoriteIds, allVehicles] = await Promise.all([
    getFavoriteVehicleIds(),
    listPublicVehicles(),
  ])

  const byId = new Map(allVehicles.map((vehicle) => [vehicle.id, vehicle]))
  const vehicles = favoriteIds
    .map((id) => byId.get(id))
    .filter((vehicle): vehicle is NonNullable<typeof vehicle> => Boolean(vehicle))

  return (
    <section className="flex-1 bg-muted/20 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-primary">Mi cuenta</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Mis favoritos
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Guarda los vehículos que más te gustan y vuelve a ellos cuando estés listo para reservar.
            </p>
          </div>

          {vehicles.length > 0 && (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm font-medium">
              <FiHeart className="fill-red-500 text-red-500" />
              {vehicles.length} {vehicles.length === 1 ? "favorito" : "favoritos"}
            </div>
          )}
        </div>

        {vehicles.length === 0 ? (
          <Empty className="rounded-2xl border bg-background py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FiHeart />
              </EmptyMedia>
              <EmptyTitle>Aún no tienes favoritos</EmptyTitle>
              <EmptyDescription>
                Pulsa el corazón de cualquier vehículo del catálogo para guardarlo aquí.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                nativeButton={false}
                render={<Link href="/catalogo" />}
                className="rounded-full"
              >
                Explorar vehículos
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.map((vehicle) => (
              <CatalogVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                userId={user.id}
                initialFavorite
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
