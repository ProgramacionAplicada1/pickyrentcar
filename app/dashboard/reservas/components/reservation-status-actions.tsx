"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Calendar01Icon,
  CheckmarkCircle02Icon,
  Flag01Icon,
  Loading03Icon,
  Time01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  advanceReservationStatus,
  cancelReservation,
} from "@/app/dashboard/reservas/actions"
import {
  RESERVATION_STATUS_LABELS,
  nextReservationStatus,
  type ReservationStatus,
} from "@/lib/vehicles/reservation-status"

type Props = {
  reservationId: string
  status: ReservationStatus | string
}

export function ReservationStatusActions({ reservationId, status }: Props) {
  const [advancePending, setAdvancePending] = React.useState(false)
  const [cancelPending, setCancelPending] = React.useState(false)

  const safeStatus: ReservationStatus =
    status === "pendiente" ||
    status === "confirmada" ||
    status === "activa" ||
    status === "finalizada" ||
    status === "cancelada"
      ? status
      : "pendiente"

  const next = nextReservationStatus(safeStatus)

  async function handleAdvance() {
    setAdvancePending(true)
    try {
      await advanceReservationStatus(reservationId)
    } finally {
      setAdvancePending(false)
    }
  }

  async function handleCancel() {
    setCancelPending(true)
    try {
      await cancelReservation(reservationId)
    } finally {
      setCancelPending(false)
    }
  }

  if (safeStatus === "cancelada" || safeStatus === "finalizada") {
    return (
      <p className="text-sm text-muted-foreground italic">
        Esta reserva está{" "}
        {safeStatus === "cancelada" ? "cancelada" : "finalizada"}. No hay más
        acciones disponibles.
      </p>
    )
  }

  const advanceIcon: React.ComponentProps<typeof HugeiconsIcon>["icon"] =
    safeStatus === "pendiente"
      ? CheckmarkCircle02Icon
      : safeStatus === "confirmada"
        ? Time01Icon
        : Flag01Icon
  const advanceLabel =
    safeStatus === "pendiente"
      ? "Marcar como pagada / confirmada"
      : safeStatus === "confirmada"
        ? "Marcar como activa (entrega)"
        : "Marcar como finalizada"

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {next && (
        <Button
          type="button"
          variant="default"
          size="lg"
          className="rounded-full"
          disabled={advancePending || cancelPending}
          onClick={handleAdvance}
        >
          {advancePending ? (
            <Spinner />
          ) : (
            <HugeiconsIcon icon={advanceIcon} strokeWidth={1.75} />
          )}
          {advanceLabel}
          <span className="hidden text-xs opacity-70 sm:inline">
            ({RESERVATION_STATUS_LABELS[next]})
          </span>
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="rounded-full"
        disabled={advancePending || cancelPending}
        onClick={handleCancel}
      >
        {cancelPending ? (
          <Spinner />
        ) : (
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={1.75} />
        )}
        Cancelar reserva
      </Button>

      <p className="flex w-full items-center gap-2 text-xs text-muted-foreground sm:w-auto">
        <HugeiconsIcon
          icon={Calendar01Icon}
          strokeWidth={1.75}
          className="size-3.5"
        />
        Tip: el avance del pago se confirmará cuando se registre el pago del
        cliente (próximamente).
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          strokeWidth={1.75}
          className="hidden size-3 sm:inline"
        />
      </p>
    </div>
  )
}