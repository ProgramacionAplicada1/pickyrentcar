"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BankIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import {
  updatePagoEstado as updatePagoEstadoAction,
} from "@/app/dashboard/pagos/actions"

type Metodo = "Efectivo" | "Transferencia"

type Estado =
  | "pendiente"
  | "completado"
  | "fallido"
  | "reembolsado"

type PagoListItem = {
  id: string
  reservation_id: string
  monto: number
  metodo_pago: Metodo
  estado: Estado
  numero: string | null
  client_name: string | null
  vehicle_label: string | null
}

const ESTADO_BADGE: Record<Estado, string> = {
  pendiente: "border border-amber-200 bg-amber-50 text-amber-700",
  completado: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  fallido: "border border-red-200 bg-red-50 text-red-700",
  reembolsado: "border border-slate-200 bg-slate-50 text-slate-700",
}

const METODO_ICON: Record<
  Metodo,
  React.ComponentProps<typeof HugeiconsIcon>["icon"]
> = {
  Efectivo: Wallet01Icon,
  Transferencia: BankIcon,
}

// ============================================================================
// Acciones por fila
// ============================================================================

export function PaymentRowActions({
  pago,
}: {
  pago: PagoListItem
}) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleConfirmPayment() {
    const confirmed = window.confirm(
      `¿Confirmar el pago de ${
        pago.numero ?? "esta reserva"
      } por ${formatCurrency(pago.monto)} mediante ${pago.metodo_pago}?`,
    )

    if (!confirmed) return

    setError(null)
    setIsProcessing(true)

    const result = await updatePagoEstadoAction(
      pago.id,
      "completado",
    )

    setIsProcessing(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    router.refresh()
  }

  if (pago.estado !== "pendiente") {
    return null
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        size="sm"
        variant="default"
        className="rounded-full"
        onClick={handleConfirmPayment}
        disabled={isProcessing}
      >
        {isProcessing ? <Spinner /> : null}
        {isProcessing
          ? "Confirmando…"
          : "Confirmar pago"}
      </Button>

      {error && (
        <p
          className="text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export type { PagoListItem }