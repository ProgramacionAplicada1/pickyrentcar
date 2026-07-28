import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Car01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CatalogVehicleCard } from "@/components/public/catalog-vehicle-card"
import { listPublicVehicles } from "@/services/catalog"

type Props = {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>
}

export default async function CatalogoPage({ searchParams }: Props) {
  const { q, from, to } = await searchParams

  const allVehicles = await listPublicVehicles()

  const query = (q ?? "").trim().toLowerCase()
  const vehicles = query
    ? allVehicles.filter((v) => {
        const haystack = [
          v.brand,
          v.model,
          v.nombre ?? "",
          v.plate,
          v.category,
        ]
          .join(" ")
          .toLowerCase()
        return haystack.includes(query)
      })
    : allVehicles

  return (
    <div className="relative flex flex-1 flex-col">
      <section className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Catálogo
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Encuentra tu próximo vehículo
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Explora nuestra flota y reserva en pocos pasos. Las tarifas son
            diarias y puedes consultar la disponibilidad en tiempo real.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <form className="rounded-2xl border bg-card p-4 sm:p-5" method="get">
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
              <Input id="from" name="from" type="date" defaultValue={from ?? ""} />
            </Field>
            <Field className="sm:w-44">
              <FieldLabel htmlFor="to">Hasta</FieldLabel>
              <Input id="to" name="to" type="date" defaultValue={to ?? ""} />
            </Field>
            <div className="flex items-end">
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="w-full rounded-full sm:w-auto"
              >
                <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.75} />
                Aplicar
              </Button>
            </div>
          </FieldGroup>
          {from && to && (
            <p className="mt-3 text-xs text-muted-foreground">
              Mostrando vehículos disponibles entre el {from} y el {to}. La
              disponibilidad exacta se confirma al abrir cada ficha.
            </p>
          )}
        </form>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        {vehicles.length === 0 ? (
          <Empty className="rounded-2xl border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={Car01Icon} strokeWidth={1.75} />
              </EmptyMedia>
              <EmptyTitle>No encontramos vehículos</EmptyTitle>
              <EmptyDescription>
                {query
                  ? "Intenta con otra palabra clave o limpia los filtros."
                  : "Vuelve pronto, estamos actualizando la flota."}
              </EmptyDescription>
            </EmptyHeader>
            {query && (
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
              <CatalogVehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
