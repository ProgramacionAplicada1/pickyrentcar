"use client";

import {
  FaMoneyCheckAlt,
  FaCreditCard,
  FaWallet,
  FaUniversity,
} from "react-icons/fa";

import { formatCurrency } from "@/lib/utils/formatCurrency";

type PaymentStatus = "Pagado" | "Pendiente" | "Parcial";

type PaymentMethod =
  | "Tarjeta"
  | "Efectivo"
  | "Transferencia";

interface ReservationPaymentProps {
  precio: number;
  metodoPago: PaymentMethod;
  estadoPago: PaymentStatus;
}

const paymentConfig = {
  Pagado: {
    color: "text-emerald-700",
    badge: "bg-emerald-50 border-emerald-200",
    progress: "bg-emerald-500",
    percentage: 100,
  },

  Parcial: {
    color: "text-amber-700",
    badge: "bg-amber-50 border-amber-200",
    progress: "bg-amber-500",
    percentage: 50,
  },

  Pendiente: {
    color: "text-red-700",
    badge: "bg-red-50 border-red-200",
    progress: "bg-red-500",
    percentage: 0,
  },
};

function PaymentIcon({
  method,
}: {
  method: PaymentMethod;
}) {
  switch (method) {
    case "Tarjeta":
      return <FaCreditCard />;

    case "Efectivo":
      return <FaWallet />;

    case "Transferencia":
      return <FaUniversity />;
  }
}

export default function ReservationPayment({
  precio,
  metodoPago,
  estadoPago,
}: ReservationPaymentProps) {
  const config = paymentConfig[estadoPago];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

      {/* Encabezado */}

      <div className="mb-5 flex items-center gap-2">

        <FaMoneyCheckAlt className="text-emerald-600" />

        <h3 className="text-sm font-bold text-slate-900">
          Información de pago
        </h3>

      </div>

      {/* Precio */}

      <div className="rounded-2xl bg-white p-4 shadow-sm">

        <p className="text-xs uppercase tracking-wider text-slate-400">
          Total de la reserva
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          {formatCurrency(precio)}
        </h2>

      </div>

      {/* Método */}

      <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">

        <p className="text-xs uppercase tracking-wider text-slate-400">
          Método de pago
        </p>

        <div className="mt-3 flex items-center gap-3">

          <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
            <PaymentIcon method={metodoPago} />
          </div>

          <span className="font-semibold text-slate-800">
            {metodoPago}
          </span>

        </div>

      </div>

      {/* Estado */}

      <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">

        <div className="flex items-center justify-between">

          <p className="text-xs uppercase tracking-wider text-slate-400">
            Estado del pago
          </p>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${config.badge} ${config.color}`}
          >
            {estadoPago}
          </span>

        </div>

        {/* Barra */}

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">

          <div
            className={`h-full transition-all duration-700 ${config.progress}`}
            style={{
              width: `${config.percentage}%`,
            }}
          />

        </div>

        <div className="mt-2 flex justify-end">

          <span className="text-xs text-slate-500">
            {config.percentage}%
          </span>

        </div>

      </div>

    </div>
  );
}