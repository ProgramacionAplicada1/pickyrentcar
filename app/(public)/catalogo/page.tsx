import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Car01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { FiCheckCircle, FiClock } from "react-icons/fi"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CatalogVehicleCard } from "@/components/public/catalog-vehicle-card"
import {
  CatalogSortSelect,
  type CatalogSort,
} from "@/components/public/catalog-sort-select"
import { getCurrentUser } from "@/services/auth"
import {
  filterPublicVehiclesByAvailability,
  listPublicVehicles,
  type PublicVehicleListItem,
} from "@/services/catalog"
import { getFavoriteVehicleIds } from "@/services/favorites"

type CatalogSearchParams = {
  q?: string
  from?: string
  to?: string
  category?: string
  sort?: string
}

type Props = {
  searchParams: Promise<CatalogSearchParams>
}

function buildCatalogHref(
  current: CatalogSearchParams,
  changes: Partial<Record<keyof CatalogSearchParams, string | null>>,
) {
  const params = new URLSearchParams()
  const merged = { ...current, ...changes }

  for (const [key, value] of Object.entries(merged)) {
    if (value && !(key === "sort" && value === "recommended")) {
      params.set(key, value)
    }
  }

  return `/catalogo${params.size ? `?${params.toString()}` : ""}`
}

function parseSort(value?: string): CatalogSort {
  if (
    value === "price_asc" ||
    value === "price_desc" ||
    value === "year_desc"
  ) {
    return value
  }
  return "recommended"
}

function sortVehicles(
  vehicles: PublicVehicleListItem[],
  sort: CatalogSort,
): PublicVehicleListItem[] {
  const result = [...vehicles]

  if (sort === "price_asc") {
    return result.sort((a, b) => Number(a.daily_price) - Number(b.daily_price))
  }
  if (sort === "price_desc") {
    return result.sort((a, b) => Number(b.daily_price) - Number(a.daily_price))
  }
  if (sort === "year_desc") {
    return result.sort((a, b) => b.year - a.year)
  }

  return result
}

function validRange(from?: string, to?: string) {
  return Boolean(from && to && /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to) && to >= from)
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Intl.DateTimeFormat("es-DO", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

function rentalDays(from: string, to: string) {
  const [fy, fm, fd] = from.split("-").map(Number)
  const [ty, tm, td] = to.split("-").map(Number)
  return Math.round(
    (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000,
  ) + 1
}

export default async function CatalogoPage({ searchParams }: Props) {
  const params = await searchParams
  const { q, from, to, category } = params
  const sort = parseSort(params.sort)

  const [allVehicles, currentUser] = await Promise.all([
    listPublicVehicles(),
    getCurrentUser(),
  ])

  const query = (q ?? "").trim().toLowerCase()
  let vehicles = allVehicles.filter((vehicle) => {
    if (query) {
      const haystack = [
        vehicle.brand,
        vehicle.model,
        vehicle.nombre ?? "",
        vehicle.plate,
        vehicle.category,
      ]
        .join(" ")
        .toLowerCase()

      if (!haystack.includes(query)) return false
    }

    if (category && vehicle.category.toLowerCase() !== category.toLowerCase()) {
      return false
    }

    return true
  })

  const hasValidRange = validRange(from, to)
  if (hasValidRange && from && to) {
    vehicles = await filterPublicVehiclesByAvailability(vehicles, from, to)
  }

  vehicles = sortVehicles(vehicles, sort)

  const categories = Array.from(
    new Set(allVehicles.map((vehicle) => vehicle.category).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "es"))

  const isClient = currentUser?.role === "cliente"
  const favoriteIds = isClient ? await getFavoriteVehicleIds() : []
  const favoriteSet = new Set(favoriteIds)
  const hasFilters = Boolean(query || from || to || category || sort !== "recommended")

  const datesQuery =
    hasValidRange && from && to
      ? `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      : ""

  return (
    <div className="relative flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b bg-muted/30">
        <div className="pointer-events-none absolute -top-24 right-[-8rem] size-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-[-6rem] size-56 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:px-6 sm:py-10">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Catálogo
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Encuentra tu próximo vehículo
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Explora nuestra flota, filtra por tus fechas y reserva en pocos pasos.
          </p>

          <div className="mt-1 flex flex-wrap gap-2.5 text-xs font-medium text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1.5">
              <FiCheckCircle className="text-primary" />
              Vehículos verificados
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1.5">
              <FiClock className="text-primary" />
              Reserva en pocos pasos
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:sticky lg:top-16 lg:z-30 lg:bg-background/95 lg:backdrop-blur">
        <form className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5" method="get">
          {category && <input type="hidden" name="category" value={category} />}
          {sort !== "recommended" && <input type="hidden" name="sort" value={sort} />}

          <FieldGroup className="gap-4 sm:flex-row sm:items-end">
            <Field className="flex-1">
              <FieldLabel htmlFor="q">Buscar</FieldLabel>
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  strokeWidth={1.75}
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  key={`q-${q ?? ""}`}
                  id="q"
                  name="q"
                  type="search"
                  placeholder="Marca, modelo, placa…"
                  defaultValue={q ?? ""}
                  className="pl-10"
                />
              </div>
            </Field>

            <Field className="sm:w-44">
              <FieldLabel htmlFor="from">Desde</FieldLabel>
              <Input
                key={`from-${from ?? ""}`}
                id="from"
                name="from"
                type="date"
                defaultValue={from ?? ""}
              />
            </Field>

            <Field className="sm:w-44">
              <FieldLabel htmlFor="to">Hasta</FieldLabel>
              <Input
                key={`to-${to ?? ""}`}
                id="to"
                name="to"
                type="date"
                defaultValue={to ?? ""}
              />
            </Field>

            <div className="flex items-end">
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full rounded-full sm:w-auto"
              >
                <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.75} />
                Buscar vehículos
              </Button>
            </div>
          </FieldGroup>

          {hasValidRange && from && to && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">
                {formatDate(from)} → {formatDate(to)} · {rentalDays(from, to)} días
              </span>
              <span>Solo se muestran vehículos libres para esas fechas.</span>
            </div>
          )}
        </form>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={buildCatalogHref(params, { category: null })}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              !category
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Todos
          </Link>
          {categories.map((item) => {
            const active = category?.toLowerCase() === item.toLowerCase()
            return (
              <Link
                key={item}
                href={buildCatalogHref(params, { category: item })}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item}
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <p className="text-sm font-semibold">
              {vehicles.length} {vehicles.length === 1 ? "vehículo" : "vehículos"}
              {hasValidRange ? " disponibles" : " encontrados"}
            </p>
            {category && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Categoría: {category}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasFilters && (
              <Link
                href="/catalogo"
                className="hidden text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:inline"
              >
                Limpiar filtros
              </Link>
            )}
            <CatalogSortSelect value={sort} />
          </div>
        </div>

        {vehicles.length === 0 ? (
          <Empty className="rounded-2xl border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Car01Icon} strokeWidth={1.75} />
              </EmptyMedia>
              <EmptyTitle>No encontramos vehículos</EmptyTitle>
              <EmptyDescription>
                {hasValidRange
                  ? "No hay vehículos libres con estos filtros y fechas. Prueba otro rango."
                  : query || category
                    ? "Intenta con otra palabra clave o limpia los filtros."
                    : "Vuelve pronto, estamos actualizando la flota."}
              </EmptyDescription>
            </EmptyHeader>
            {hasFilters && (
              <EmptyContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  nativeButton={false}
                  render={<Link href="/catalogo" />}
                >
                  Limpiar filtros
                </Button>
              </EmptyContent>
            )}
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.map((vehicle) => (
              <CatalogVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                userId={isClient ? currentUser?.id : null}
                initialFavorite={favoriteSet.has(vehicle.id)}
                showFavorite={currentUser?.role !== "admin"}
                detailHref={`/catalogo/${vehicle.id}${datesQuery}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
