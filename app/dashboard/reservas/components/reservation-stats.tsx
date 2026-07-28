import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Car01Icon,
  Clock01Icon,
DollarCircleIcon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/formatCurrency"

type Props = {
  total: number
  activas: number
  hoy: number
  facturado: number
}

export function ReservationStats({
  total,
  activas,
  hoy,
  facturado,
}: Props) {
const items: Array<{
    label: string
    value: string
    icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
    note: string
  }> = [
    {
      label: "Reservas totales",
      value: String(total),
      icon: Calendar01Icon,
      note: "Histórico",
    },
    {
      label: "Activas",
      value: String(activas),
      icon: Car01Icon,
      note: "Confirmadas + en curso",
    },
    {
      label: "Hoy",
      value: String(hoy),
      icon: Clock01Icon,
      note: "Inician o están vigentes",
    },
    {
      label: "Facturado",
      value: formatCurrency(facturado),
      icon: DollarCircleIcon,
      note: "Total acumulado",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((stat) => (
        <Card key={stat.label} className="gap-3 rounded-2xl p-5">
          <CardContent className="flex flex-col gap-2 p-0">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <div className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HugeiconsIcon
                  icon={stat.icon}
                  strokeWidth={1.75}
                  className="size-4"
                />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.note}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}