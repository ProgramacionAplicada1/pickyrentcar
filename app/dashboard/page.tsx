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
import { Separator } from "@/components/ui/separator"
import { getVehicleStats } from "@/services/vehicles"
import { getCurrentUser } from "@/services/auth"

type StatTone = "primary" | "emerald" | "amber" | "red"

type Stat = {
  title: string
  value: number
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  note: string
  tone: StatTone
}
const TONE_STYLES: Record<
  StatTone,
  { icon: string; bar: string; border: string }
> = {
  primary: {
    icon: "bg-blue-500/10 text-blue-500",
    bar: "bg-blue-500",
    border: "border-blue-500/30",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-500",
    bar: "bg-emerald-500",
    border: "border-emerald-500/30",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-500",
    bar: "bg-amber-500",
    border: "border-amber-500/30",
  },
  red: {
    icon: "bg-red-500/10 text-red-500",
    bar: "bg-red-500",
    border: "border-red-500/30",
  },
}

function formatToday() {
  const formatted = new Intl.DateTimeFormat("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export default async function DashboardPage() {
  const [{ total, available, inUse, maintenance }, user] = await Promise.all([
    getVehicleStats(),
    getCurrentUser(),
  ])

  const firstName = user?.displayName?.split(" ")[0] ?? "de nuevo"

  const stats: Stat[] = [
    {
      title: "Total vehículos",
      value: total,
      icon: Car01Icon,
      note: "Flota registrada",
      tone: "primary",
    },
    {
      title: "Disponibles",
      value: available,
      icon: Tick02Icon,
      note: "Listos para alquilar",
      tone: "emerald",
    },
    {
      title: "En uso",
      value: inUse,
      icon: Time01Icon,
      note: "Reservas activas",
      tone: "amber",
    },
    {
      title: "Mantenimiento",
      value: maintenance,
      icon: Wrench01Icon,
      note: "En servicio",
      tone: "red",
    },
  ]

  return (

    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-2xl font-bold tracking-tight">
          Hola, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">{formatToday()}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={`gap-3 rounded-2xl border p-5 transition-shadow hover:shadow-md ${TONE_STYLES[stat.tone].border}`}
          >
            <CardContent className="flex flex-col gap-2 p-0">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div
                  className={`inline-flex size-9 items-center justify-center rounded-full ${TONE_STYLES[stat.tone].icon}`}
                >
                  <HugeiconsIcon
                    icon={stat.icon}
                    strokeWidth={1.75}
                    className="size-4"
                  />
                </div>
              </div>
              <p className="text-3xl font-bold tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.note}</p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${TONE_STYLES[stat.tone].bar}`}
                  style={{
                    width: total > 0 ? `${(stat.value / total) * 100}%` : "0%",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {total > 0 && (
        <Card className="gap-4 rounded-2xl p-6">
          <CardHeader className="p-0">
            <CardTitle className="text-base">Estado de la flota</CardTitle>
            <CardDescription>
              Distribución actual de tus {total} vehículo
              {total === 1 ? "" : "s"} por estado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-0">
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
              {available > 0 && (
                <div
                  className={TONE_STYLES.emerald.bar}
                  style={{ width: `${(available / total) * 100}%` }}
                />
              )}
              {inUse > 0 && (
                <div
                  className={TONE_STYLES.amber.bar}
                  style={{ width: `${(inUse / total) * 100}%` }}
                />
              )}
              {maintenance > 0 && (
                <div
                  className={TONE_STYLES.red.bar}
                  style={{ width: `${(maintenance / total) * 100}%` }}
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <LegendItem
                tone="emerald"
                label={`Disponibles (${available})`}
              />
              <LegendItem tone="amber" label={`En uso (${inUse})`} />
              <LegendItem
                tone="red"
                label={`Mantenimiento (${maintenance})`}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-0" />

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
function LegendItem({ tone, label }: { tone: StatTone; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`size-2 rounded-full ${TONE_STYLES[tone].bar}`}
        aria-hidden
      />
      {label}
    </span>
  )
}