"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Flag01Icon,
  Key01Icon,
} from "@hugeicons/core-free-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  advanceReservationStatus,
  cancelReservation,
} from "@/app/dashboard/reservas/actions";
import {
  RESERVATION_STATUS_LABELS,
  canCancelReservation,
  isReservationStatus,
  nextReservationStatus,
  type ReservationStatus,
} from "@/lib/vehicles/reservation-status";

type Props = {
  reservationId: string;
  status: ReservationStatus | string;
  /** Hay un pago reportado esperando revisión. */
  paymentInReview: boolean;
  paymentDueAt: string | null;
};

const ADVANCE_COPY: Partial<
  Record<ReservationStatus, { label: string; icon: typeof CheckmarkCircle02Icon }>
> = {
  pendiente: { label: "Aceptar reserva", icon: CheckmarkCircle02Icon },
  confirmada: { label: "Entregar vehículo", icon: Key01Icon },
  activa: { label: "Finalizar renta", icon: Flag01Icon },
};

function formatDeadline(value: string) {
  return new Date(value).toLocaleString("es-DO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ReservationStatusActions({
  reservationId,
  status,
  paymentInReview,
  paymentDueAt,
}: Props) {
  const router = useRouter();
  const [advancePending, setAdvancePending] = React.useState(false);
  const [cancelPending, setCancelPending] = React.useState(false);

  const safeStatus: ReservationStatus = isReservationStatus(status)
    ? status
    : "pendiente";
  const next = nextReservationStatus(safeStatus);
  const advance = ADVANCE_COPY[safeStatus];

  async function handleAdvance() {
    setAdvancePending(true);
    try {
      const result = await advanceReservationStatus(reservationId);
      if (result.ok) {
        toast.success(
          safeStatus === "pendiente"
            ? "Reserva aceptada. El cliente tiene 48 h para pagar."
            : "Estado actualizado.",
        );
        router.refresh();
      } else {
        toast.error(result.error ?? "No se pudo avanzar la reserva.");
      }
    } finally {
      setAdvancePending(false);
    }
  }

  async function handleCancel() {
    setCancelPending(true);
    try {
      const result = await cancelReservation(reservationId);
      if (result.ok) {
        toast.success("Reserva cancelada.");
        router.refresh();
      } else {
        toast.error(result.error ?? "No se pudo cancelar la reserva.");
      }
    } finally {
      setCancelPending(false);
    }
  }

  if (safeStatus === "cancelada" || safeStatus === "finalizada") {
    return (
      <p className="text-sm text-muted-foreground">
        Esta reserva está {RESERVATION_STATUS_LABELS[safeStatus].toLowerCase()}.
        No hay más acciones disponibles.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {safeStatus === "pendiente_pago" ? (
        <Alert>
          <AlertTitle>
            {paymentInReview ? "Pago por revisar" : "Esperando el pago del cliente"}
          </AlertTitle>
          <AlertDescription>
            {paymentInReview
              ? "El cliente informó un pago. Revísalo en Pagos para confirmar la reserva."
              : `Las fechas están apartadas${
                  paymentDueAt ? ` hasta el ${formatDeadline(paymentDueAt)}` : ""
                }. Si el cliente no paga a tiempo, la reserva se cancela sola.`}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {safeStatus === "pendiente_pago" && paymentInReview ? (
          <Button
            className="rounded-full"
            size="lg"
            nativeButton={false}
            render={<a href="/dashboard/pagos" />}
          >
            Revisar pago
          </Button>
        ) : null}

        {next && advance ? (
          <Button
            type="button"
            size="lg"
            className="rounded-full"
            disabled={advancePending || cancelPending}
            onClick={handleAdvance}
          >
            {advancePending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <HugeiconsIcon icon={advance.icon} strokeWidth={1.75} data-icon="inline-start" />
            )}
            {advance.label}
          </Button>
        ) : null}

        {canCancelReservation(safeStatus) ? (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="rounded-full"
                  disabled={advancePending || cancelPending}
                />
              }
            >
              {cancelPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.75} data-icon="inline-start" />
              )}
              Cancelar reserva
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar reserva</AlertDialogTitle>
                <AlertDialogDescription>
                  Las fechas quedarán libres para otros clientes. Esta acción no
                  se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Volver</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleCancel}>
                  Cancelar reserva
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </div>
  );
}
