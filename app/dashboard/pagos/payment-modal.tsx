"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { confirmPago, rejectPago } from "@/app/dashboard/pagos/actions";

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
// Acciones por fila (solo pagos pendientes)
// ============================================================================

export function PaymentRowActions({ pago }: { pago: PagoListItem }) {
  if (pago.estado !== "pendiente") return null;

  return (
    <div className="flex items-center justify-end gap-2">
      <RejectPaymentButton pago={pago} />
      <ConfirmPaymentButton pago={pago} />
    </div>
  );
}

function ConfirmPaymentButton({ pago }: { pago: PagoListItem }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const isCash = pago.metodo_pago === "Efectivo";

  async function handleConfirm() {
    setIsProcessing(true);
    const result = await confirmPago(pago.id);
    setIsProcessing(false);

    if (!result.ok) {
      toast.error("No se pudo confirmar el pago.", { description: result.error });
      return;
    }

    setOpen(false);
    toast.success(`Pago de ${pago.numero ?? "la reserva"} confirmado. La reserva quedó confirmada.`);
    router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button type="button" size="sm" className="rounded-full" />}>
        {isCash ? "Cobrado" : "Confirmar"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isCash ? "Confirmar cobro en efectivo" : "Confirmar pago"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Confirmas que recibiste {formatCurrency(pago.monto)}
            {isCash ? " en efectivo" : " por transferencia"} para{" "}
            {pago.numero ?? "esta reserva"}? La reserva pasará a{" "}
            <strong>Confirmada</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? <Spinner data-icon="inline-start" /> : null}
            {isProcessing ? "Confirmando…" : "Confirmar pago"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RejectPaymentButton({ pago }: { pago: PagoListItem }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [motivo, setMotivo] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const invalid = motivo.trim().length < 3;

  async function handleReject() {
    setIsProcessing(true);
    const result = await rejectPago(pago.id, motivo);
    setIsProcessing(false);

    if (!result.ok) {
      toast.error("No se pudo rechazar el pago.", { description: result.error });
      return;
    }

    setOpen(false);
    setMotivo("");
    toast.success("Pago rechazado. El cliente tiene 48 h para volver a pagar.");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" size="sm" variant="outline" className="rounded-full" />}
      >
        Rechazar
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar pago</DialogTitle>
          <DialogDescription>
            {pago.numero ?? "Reserva"} · {formatCurrency(pago.monto)}. El
            cliente verá el motivo y podrá volver a pagar en las próximas 48 h.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor={`reject-${pago.id}`}>Motivo</FieldLabel>
          <Textarea
            id={`reject-${pago.id}`}
            value={motivo}
            onChange={(event) => setMotivo(event.currentTarget.value)}
            placeholder="Ej. No encontramos la transferencia con esa referencia."
            maxLength={500}
            disabled={isProcessing}
          />
          <FieldDescription>Mínimo 3 caracteres.</FieldDescription>
        </Field>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />} disabled={isProcessing}>
            Cancelar
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isProcessing || invalid}
          >
            {isProcessing ? <Spinner data-icon="inline-start" /> : null}
            Rechazar pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { PagoListItem };
