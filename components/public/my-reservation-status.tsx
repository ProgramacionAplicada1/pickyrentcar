import { Badge } from "@/components/ui/badge"
import {
  RESERVATION_STATUS_LABELS,
  isReservationStatus,
} from "@/lib/vehicles/reservation-status"

const VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pendiente: "outline",
  pendiente_pago: "secondary",
  confirmada: "default",
  activa: "default",
  finalizada: "secondary",
  cancelada: "destructive",
}

/**
 * Estado de la reserva para el cliente. `paymentInReview` muestra
 * "Pago en revisión" cuando está por pagar pero ya reportó un pago.
 */
export function MyReservationStatus({
  status,
  paymentInReview = false,
}: {
  status: string
  paymentInReview?: boolean
}) {
  const label =
    status === "pendiente_pago" && paymentInReview
      ? "Pago en revisión"
      : isReservationStatus(status)
        ? RESERVATION_STATUS_LABELS[status]
        : status

  return (
    <Badge variant={VARIANTS[status] ?? "outline"} className="w-fit">
      {label}
    </Badge>
  )
}
