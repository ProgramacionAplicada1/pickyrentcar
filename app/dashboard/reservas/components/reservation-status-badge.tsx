import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Time01Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import {
  RESERVATION_STATUSES,
  RESERVATION_STATUS_LABELS,
  type ReservationStatus,
} from "@/lib/vehicles/reservation-status"

const ICON_BY_STATUS: Record<
  ReservationStatus,
  React.ComponentProps<typeof HugeiconsIcon>["icon"]
> = {
  pendiente: Clock01Icon,
  confirmada: CheckmarkCircle02Icon,
  activa: Time01Icon,
  finalizada: CheckmarkCircle02Icon,
  cancelada: Cancel01Icon,
}

const VARIANT_BY_STATUS: Record<
  ReservationStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  pendiente: "secondary",
  confirmada: "default",
  activa: "default",
  finalizada: "outline",
  cancelada: "destructive",
}

export function ReservationStatusBadge({
  status,
}: {
  status: ReservationStatus | string
}) {
  const safeStatus: ReservationStatus = (
    RESERVATION_STATUSES as readonly string[]
  ).includes(status)
    ? (status as ReservationStatus)
    : "pendiente"

  const Icon = ICON_BY_STATUS[safeStatus]
  return (
    <Badge variant={VARIANT_BY_STATUS[safeStatus]} className="gap-1.5">
      <HugeiconsIcon icon={Icon} strokeWidth={2} className="size-3.5" />
      {RESERVATION_STATUS_LABELS[safeStatus]}
    </Badge>
  )
}

void Wrench01Icon