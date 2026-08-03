interface StatusBadgeProps {
  status: string
}

const statusStyles: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  activa: "bg-emerald-100 text-emerald-700",
  confirmada: "bg-blue-100 text-blue-700",
  finalizada: "bg-slate-100 text-slate-700",
  cancelada: "bg-red-100 text-red-700",
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const normalizedStatus = status
    .trim()
    .toLowerCase()

  const statusStyle =
    statusStyles[normalizedStatus] ??
    "bg-slate-100 text-slate-700"

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}
    >
      {status}
    </span>
  )
}