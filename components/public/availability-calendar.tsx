"use client"

import * as React from "react"
import { es } from "date-fns/locale"
import { DateRange, type DateRange as DateRangeType } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"

type Props = {
  disabledRanges: Array<{ from: string; to: string }>
  selected: DateRange | undefined
  onSelect: (range: DateRange | undefined) => void
  minDate?: Date
}

function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function AvailabilityCalendar({
  disabledRanges,
  selected,
  onSelect,
  minDate,
}: Props) {
  const reservedRanges = React.useMemo(() => {
    return disabledRanges
      .map((r) => {
        const f = parseLocalDate(r.from)
        const t = parseLocalDate(r.to)
        if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) return null
        return { from: f, to: t }
      })
      .filter((r): r is { from: Date; to: Date } => Boolean(r))
  }, [disabledRanges])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const pastRange: DateRangeType = {
    from: new Date(1900, 0, 1),
    to: new Date(today.getTime() - 86400000),
  }

  const disabled = [pastRange, ...reservedRanges]

  return (
    <div className="flex justify-center">
      <Calendar
        mode="range"
        numberOfMonths={1}
        locale={es}
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        modifiers={{
          reserved: reservedRanges,
          past: pastRange,
        }}
        modifiersClassNames={{
          reserved: "bg-red-100 text-red-700 hover:bg-red-100 line-through",
          past: "text-muted-foreground/40",
        }}
        defaultMonth={minDate ?? new Date()}
        className="rounded-2xl border bg-card"
      />
    </div>
  )
}