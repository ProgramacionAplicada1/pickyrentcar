import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Flag01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import {
  RESERVATION_STATUS_LABELS,
  type ReservationStatus,
} from "@/lib/vehicles/reservation-status"

type Props = {
  status: ReservationStatus | string
}

const ICONS: Record<string, React.ComponentProps<typeof HugeiconsIcon>["icon"]> = {
  pendiente: Calendar01Icon,
  confirmada: CheckmarkCircle02Icon,
  activa: Flag01Icon,
  finalizada: Clock01Icon,
  cancelada: Cancel01Icon,
}

const VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pendiente: "outline",
  confirmada: "default",
  activa: "default",
  finalizada: "secondary", 
  cancelada: "destructive",
}

export function ReservationStatusBadge({ status }: Props) {
  const isKnown =
    status === "pendiente" ||
    status === "confirmada" ||
    status === "activa" ||
    status === "finalizada" ||
    status === "cancelada"

  const safeStatus: ReservationStatus = isKnown
    ? (status as ReservationStatus)
    : "pendiente"

  const icon = ICONS[safeStatus] ?? Calendar01Icon
  const variant = VARIANTS[safeStatus] ?? "outline"
  const label = RESERVATION_STATUS_LABELS[safeStatus] ?? status

  return (
    <Badge variant={variant} className="gap-1.5">
      <HugeiconsIcon icon={icon} strokeWidth={1.75} className="size-3.5" />
      {label}
    </Badge>
  )
}