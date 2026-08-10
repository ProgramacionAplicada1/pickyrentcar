import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dotClassName: string }
> = {
  pendiente: {
    label: "Pendiente",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-500",
  },
  confirmada: {
    label: "Confirmada",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    dotClassName: "bg-emerald-500",
  },
  activa: {
    label: "Activa",
    className: "border-sky-200 bg-sky-50 text-sky-800",
    dotClassName: "bg-sky-500",
  },
  finalizada: {
    label: "Finalizada",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    dotClassName: "bg-slate-500",
  },
  cancelada: {
    label: "Cancelada",
    className: "border-red-200 bg-red-50 text-red-700",
    dotClassName: "bg-red-500",
  },
}

export function MyReservationStatus({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "border-border bg-muted text-muted-foreground",
    dotClassName: "bg-muted-foreground",
  }

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        config.className,
      )}
    >
      <span className={cn("size-2 rounded-full", config.dotClassName)} />
      {config.label}
    </span>
  )
}
