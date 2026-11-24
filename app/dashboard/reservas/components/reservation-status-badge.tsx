import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Flag01Icon,
  Money03Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import {
  RESERVATION_STATUS_LABELS,
  isReservationStatus,
  type ReservationStatus,
} from "@/lib/vehicles/reservation-status"

type Props = {
  status: ReservationStatus | string
}

const ICONS: Record<ReservationStatus, React.ComponentProps<typeof HugeiconsIcon>["icon"]> = {
  pendiente: Calendar01Icon,
  pendiente_pago: Money03Icon,
  confirmada: CheckmarkCircle02Icon,
  activa: Flag01Icon,
  finalizada: Clock01Icon,
  cancelada: Cancel01Icon,
}

const VARIANTS: Record<
  ReservationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pendiente: "outline",
  pendiente_pago: "secondary",
  confirmada: "default",
  activa: "default",
  finalizada: "secondary",
  cancelada: "destructive",
}

export function ReservationStatusBadge({ status }: Props) {
  const safeStatus: ReservationStatus = isReservationStatus(status)
    ? status
    : "pendiente"

  return (
    <Badge variant={VARIANTS[safeStatus]}>
      <HugeiconsIcon icon={ICONS[safeStatus]} strokeWidth={1.75} data-icon="inline-start" />
      {RESERVATION_STATUS_LABELS[safeStatus]}
    </Badge>
  )
}
