import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Car01Icon,
  Tick02Icon,
  Time01Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"

type Stat = {
  title: string
  value: string
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  note: string
}

async function getVehicleStats() {
  const supabase = await createClient()

  const [total, available, inUse, maintenance] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("status", "available"),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_use"),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("status", "maintenance"),
  ])

  return {
    total: total.count ?? 0,
    available: available.count ?? 0,
    inUse: inUse.count ?? 0,
    maintenance: maintenance.count ?? 0,
  }
}

export default async function DashboardPage() {
  const { total, available, inUse, maintenance } = await getVehicleStats()

  const stats: Stat[] = [
    {
      title: "Total vehículos",
      value: String(total),
      icon: Car01Icon,
      note: "Flota registrada",
    },
    {
      title: "Disponibles",
      value: String(available),
      icon: Tick02Icon,
      note: "Listos para alquilar",
    },
    {
      title: "En uso",
      value: String(inUse),
      icon: Time01Icon,
      note: "Reservas activas",
    },
    {
      title: "Mantenimiento",
      value: String(maintenance),
      icon: Wrench01Icon,
      note: "En servicio",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="gap-3 rounded-2xl p-5">
            <CardContent className="flex flex-col gap-2 p-0">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <HugeiconsIcon
                    icon={stat.icon}
                    strokeWidth={1.75}
                    className="size-4"
                  />
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="gap-4 rounded-2xl p-6">
        <CardHeader className="p-0">
          <CardTitle>Flota de vehículos</CardTitle>
          <CardDescription>
            Gestiona los vehículos de tu empresa. Ve a la sección de vehículos
            para crear nuevos registros o administrar los existentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 p-0 pt-2 text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon
              icon={Car01Icon}
              strokeWidth={1.75}
              className="size-6"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold">
              {total === 0
                ? "Aún no hay vehículos"
                : `${total} vehículo${total === 1 ? "" : "s"} registrado${total === 1 ? "" : "s"}`}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {total === 0
                ? "Comienza creando tu primer vehículo para empezar a gestionar tu flota."
                : "Puedes gestionar el estado de cada vehículo desde la tabla."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/dashboard/vehicles" />}
            >
              Ver vehículos
            </Button>
            <Button
              variant="default"
              size="lg"
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/dashboard/vehicles/new" />}
            >
              <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
              {total === 0
                ? "Crear primer vehículo"
                : "Crear vehículo"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
