import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/services/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: "Reserva recibida · PickyRentCar",
}

type Props = {
  searchParams: Promise<{ numero?: string }>
}

export default async function GraciasPage({ searchParams }: Props) {
  const { numero } = await searchParams
  const reservationNumber = numero ?? "—"
  const user = await getCurrentUser()
  const isClient = user?.role === "cliente"

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20">
      <Card className="gap-6 rounded-3xl p-8 text-center sm:p-10">
        <div className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            strokeWidth={1.75}
            className="size-8"
          />
        </div>
        <CardHeader className="gap-2 p-0">
          <CardTitle className="text-2xl sm:text-3xl">
            ¡Tu reserva fue recibida!
          </CardTitle>
          <CardDescription>
            Pronto recibirás un correo de confirmación con los siguientes
            pasos para completar el pago del anticipo.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 p-0">
          <div className="flex flex-col gap-1 rounded-2xl border bg-muted/30 p-4">
            <span className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
              Número de reserva
            </span>
            <span className="font-mono text-lg font-semibold tracking-wider">
              {reservationNumber}
            </span>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border bg-background p-4 text-left">
            <p className="flex items-center gap-2 text-sm font-medium">
              <HugeiconsIcon
                icon={Mail01Icon}
                strokeWidth={1.75}
                className="size-4 text-muted-foreground"
              />
              Próximos pasos
            </p>
            <ul className="ml-4 list-disc space-y-1.5 text-sm text-muted-foreground">
              <li>Revisa tu correo para los detalles de pago.</li>
              <li>
                Una vez recibido el anticipo, tu reserva pasará a estado
                &quot;Confirmada&quot;.
              </li>
              <li>
                Conserva tu número de reserva para cualquier consulta.
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {isClient && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/mis-reservas" />}
              >
                Ver mis reservas
              </Button>
            )}
            <Button
              variant="default"
              size="lg"
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/catalogo" />}
            >
              Ver más vehículos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}