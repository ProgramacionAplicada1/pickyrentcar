import type { AdaptedReservationStatus } from "../../data/mockReservations";

interface StatusBadgeProps {
  status: AdaptedReservationStatus;
}

const statusConfig: Record<
  AdaptedReservationStatus,
  {
    text: string;
    dot: string;
    badge: string;
  }
> = {
  "En curso": {
    text: "En curso",
    dot: "bg-emerald-500",
    badge: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  Confirmada: {
    text: "Confirmada",
    dot: "bg-teal-500",
    badge: "border border-teal-200 bg-teal-50 text-teal-700",
  },
  "Por pagar": {
    text: "Por pagar",
    dot: "bg-orange-500",
    badge: "border border-orange-200 bg-orange-50 text-orange-700",
  },
  "Pago en revisión": {
    text: "Pago en revisión",
    dot: "bg-violet-500",
    badge: "border border-violet-200 bg-violet-50 text-violet-700",
  },
  Pendiente: {
    text: "Pendiente",
    dot: "bg-amber-500",
    badge: "border border-amber-200 bg-amber-50 text-amber-700",
  },
  Finalizada: {
    text: "Finalizada",
    dot: "bg-blue-500",
    badge: "border border-blue-200 bg-blue-50 text-blue-700",
  },
  Cancelada: {
    text: "Cancelada",
    dot: "bg-red-500",
    badge: "border border-red-200 bg-red-50 text-red-700",
  },
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
      {config.text}
    </span>
  );
}