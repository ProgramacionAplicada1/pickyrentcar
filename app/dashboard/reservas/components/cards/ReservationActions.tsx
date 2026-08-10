"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FaEye,
  FaEdit, 
  FaPrint,
  FaEllipsisH,
  FaCheck,
  FaBan,
} from "react-icons/fa";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  advanceReservationStatus,
  cancelReservation,
} from "@/app/dashboard/reservas/actions";
import type { Reservation } from "../../data/mockReservations";

interface ReservationActionsProps {
  reservation: Reservation;
  onView?: (reservation: Reservation) => void;
  hasCompletedPayment?: boolean;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  color?: string;
  hover?: string;
  onClick?: () => void;
}

function ActionButton({
  icon,
  title,
  color = "text-slate-600",
  hover = "hover:bg-slate-100",
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`
        group
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-xl
        border
        border-slate-200
        bg-white
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-md
        ${hover}
        ${color}
      `}
    >
      {icon}
    </button>
  );
}

export default function ReservationActions({
  reservation,
  onView,
  hasCompletedPayment = false,
}: ReservationActionsProps) {
  const router = useRouter()
  const [advancePending, setAdvancePending] = React.useState(false)
  const [cancelPending, setCancelPending] = React.useState(false)

  async function handleAdvance() {
    setAdvancePending(true)
    try {
      const result = await advanceReservationStatus(reservation.id)
      if (result.ok) {
        router.refresh()
      }
    } finally {
      setAdvancePending(false)
    }
  }

  async function handleCancel() {
    setCancelPending(true)
    try {
      const result = await cancelReservation(reservation.id)
      if (result.ok) {
        router.refresh()
      }
    } finally {
      setCancelPending(false)
    }
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print() 
    }
  }

  function handleViewDetail() {
    router.push(`/dashboard/reservas/${reservation.id}`)
  }

const isFinal = reservation.estado === "Cancelada" || reservation.estado === "Finalizada"
const isPending = reservation.estado === "Pendiente"
const isPendingPayment = reservation.estado === "Pendiente de pago"

const requiresPaymentToAdvance = isPendingPayment && !hasCompletedPayment;

  return (
    <div className="flex items-center justify-end gap-2">
      <ActionButton
        title="Ver detalles (drawer)"
        icon={<FaEye />}
        color="text-blue-600"
        hover="hover:bg-blue-50"
        onClick={() => onView?.(reservation)}
      />

      <ActionButton
        title="Ver detalle"
        icon={<FaEdit />}
        color="text-amber-600"
        hover="hover:bg-amber-50"
        onClick={handleViewDetail}
      />

      <ActionButton
        title="Imprimir contrato"
        icon={<FaPrint />}
        color="text-emerald-600"
        hover="hover:bg-emerald-50"
        onClick={handlePrint}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              title="Más opciones"
              aria-label="Más opciones"
              className="group flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-md"
            />
          }
        >
          <FaEllipsisH />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={
              isFinal ||
              advancePending ||
              cancelPending ||
              requiresPaymentToAdvance
            }
            onClick={handleAdvance}
          >
            {advancePending ? <Spinner /> : <FaCheck />}
            Avanzar estado
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={isFinal || advancePending || cancelPending}
            onClick={handleCancel}
          >
            {cancelPending ? <Spinner /> : <FaBan />}
            Cancelar reserva
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handlePrint}>
            <FaPrint />
            Imprimir contrato
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}