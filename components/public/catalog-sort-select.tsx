"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FiSliders } from "react-icons/fi"

export type CatalogSort =
  | "recommended"
  | "price_asc"
  | "price_desc"
  | "year_desc"

export function CatalogSortSelect({ value }: { value: CatalogSort }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = React.useTransition()

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString())
    const next = event.target.value

    if (next === "recommended") params.delete("sort")
    else params.set("sort", next)

    startTransition(() => {
      router.replace(`/catalogo${params.size ? `?${params.toString()}` : ""}`, {
        scroll: false,
      })
    })
  }

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <FiSliders className="size-4" />
      <span className="hidden sm:inline">Ordenar:</span>
      <select
        value={value}
        onChange={onChange}
        disabled={pending}
        className="h-9 rounded-full border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
        aria-label="Ordenar vehículos"
      >
        <option value="recommended">Recomendados</option>
        <option value="price_asc">Menor precio</option>
        <option value="price_desc">Mayor precio</option>
        <option value="year_desc">Más recientes</option>
      </select>
    </label>
  )
}
