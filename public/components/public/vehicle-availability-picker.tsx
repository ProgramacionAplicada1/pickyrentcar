"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { DateRange } from "react-day-picker"

import { AvailabilityCalendar } from "@/components/public/availability-calendar"

type Props = {
  vehicleId: string
  disabledRanges: Array<{ from: string; to: string }>
}

export function VehicleAvailabilityPicker({
  vehicleId,
  disabledRanges,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const fromParam = searchParams.get("from") ?? ""
  const toParam = searchParams.get("to") ?? ""

  const initial: DateRange | undefined =
    fromParam && toParam
      ? {
          from: parseLocal(fromParam),
          to: parseLocal(toParam),
        }
      : undefined

  const [range, setRange] = React.useState<DateRange | undefined>(initial)

  function commit(next: DateRange | undefined) {
    setRange(next)
    const params = new URLSearchParams(searchParams.toString())
    if (next?.from && next?.to) {
      params.set("from", toIsoDate(next.from))
      params.set("to", toIsoDate(next.to))
    } else {
      params.delete("from")
      params.delete("to")
    }
    router.replace(`/catalogo/${vehicleId}?${params.toString()}`, {
      scroll: false,
    })
  }

  return (
    <AvailabilityCalendar
      disabledRanges={disabledRanges}
      selected={range}
      onSelect={commit}
    />
  )
}

function parseLocal(value: string): Date {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}