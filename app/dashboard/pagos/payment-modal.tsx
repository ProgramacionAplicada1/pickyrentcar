"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { updatePagoEstado as updatePagoEstadoAction } from "@/app/dashboard/pagos/actions";

type Metodo = "Efectivo" | "Transferencia";

type Estado = "pendiente" | "completado" | "fallido" | "reembolsado";

type PagoListItem = {
  id: string;
  reservation_id: string;
  monto: number;
  metodo_pago: Metodo;
  estado: Estado;
  numero: string | null;
  client_name: string | null;
  vehicle_label: string | null;
};

// ============================================================================
// Acciones por fila
// ============================================================================

export function PaymentRowActions({ pago }: { pago: PagoListItem }) {
  const router = useRouter();

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleConfirmPayment() {
    const confirmed = window.confirm(
      `¿Confirmar el pago de ${pago.numero ?? "esta reserva"} por ${formatCurrency(
        pago.monto,
      )} mediante ${pago.metodo_pago}?`,
    );

    if (!confirmed) return;

    setError(null);
    setIsProcessing(true);

    const result = await updatePagoEstadoAction(pago.id, "completado");

    setIsProcessing(false);

    if (!result.ok) { 
      setError(result.error);
      return;
    }

    router.refresh();
  }

  // Solo mostramos acciones para pagos pendientes.
  if (pago.estado !== "pendiente") {
    return null;
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
        {isProcessing && <Spinner />}
        {isProcessing ? "Confirmando…" : "Confirmar pago"}
      </Button>

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export type { PagoListItem };