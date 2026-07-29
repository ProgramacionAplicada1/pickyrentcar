import { FaCreditCard } from "react-icons/fa";

import { formatCurrency } from "@/lib/utils/formatCurrency";

interface ReservationPaymentProps {
  precio: number;
  precioDiario: number;
  metodoPago: string | null;
  estadoPago: string | null;
}

const paymentStyles: Record<string, string> = {
  pagado: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pendiente: "border-amber-200 bg-amber-50 text-amber-700",
  parcial: "border-blue-200 bg-blue-50 text-blue-700",
};

export default function ReservationPayment({
  precio,
  precioDiario,
  metodoPago,
  estadoPago,
}: ReservationPaymentProps) {
  const normalizedPaymentStatus = estadoPago
    ?.trim()
    .toLowerCase();

  const paymentStatusLabel =
    estadoPago ?? "Pago no registrado";

  const paymentStatusStyle = normalizedPaymentStatus
    ? paymentStyles[normalizedPaymentStatus] ??
      "border-slate-200 bg-slate-100 text-slate-600"
    : "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Total de la reserva
      </p>

      <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        {formatCurrency(precio)}
      </h3>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${
            normalizedPaymentStatus === "pagado"
              ? "w-full bg-emerald-500"
              : normalizedPaymentStatus === "parcial"
                ? "w-1/2 bg-blue-500"
                : "w-0 bg-slate-400"
          }`}
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
          <FaCreditCard />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-slate-400">
            Precio diario
          </p>

          <p className="font-semibold text-slate-800">
            {formatCurrency(precioDiario)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${paymentStatusStyle}`}
        >
          {paymentStatusLabel}
        </span>

        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
          {metodoPago ?? "Método no registrado"}
        </span>
      </div>
    </div>
  );
}