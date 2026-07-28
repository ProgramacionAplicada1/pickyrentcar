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

export function AvailabilityCalendar({
  disabledRanges,
  selected,
  onSelect,
  minDate,
}: Props) {
  const disabled = React.useMemo(() => {
    const ranges = disabledRanges
      .map((r) => {
        const f = new Date(r.from)
        const t = new Date(r.to)
        if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) return null
        return { from: f, to: t }
      })
      .filter((r): r is { from: Date; to: Date } => Boolean(r))
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const past: DateRangeType = { from: new Date(1900, 0, 1), to: today }
    return [past, ...ranges]
  }, [disabledRanges])

  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      locale={es}
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      defaultMonth={minDate ?? new Date()}
      className="rounded-2xl border bg-card"
    />
  )
}