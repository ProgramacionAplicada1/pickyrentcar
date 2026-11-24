import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { BankIcon } from "@hugeicons/core-free-icons"
import { FiArrowLeft } from "react-icons/fi"

import { CashPaymentButton } from "@/components/public/cash-payment-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BackButton } from "@/components/ui/back-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { getCurrentUser } from "@/services/auth"
import { getMyReservationById } from "@/services/my-reservations"

export const metadata: Metadata = { title: "Pagar reserva · PickyRentCar" }

type Props = { params: Promise<{ id: string }> }

function formatDeadline(value: string) {
  return new Date(value).toLocaleString("es-DO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function PagarReservacion({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/mis-reservas/${id}/pagar`)}`)
  }
  if (user.role === "admin") {
    redirect("/dashboard")
  }

  const reservation = await getMyReservationById(id)
  if (!reservation) notFound()

  // Solo se paga una reserva aceptada y sin pago en revisión.
  if (
    reservation.status !== "pendiente_pago" ||
    reservation.latest_payment?.estado === "pendiente"
  ) {
    redirect(`/mis-reservas/${id}`)
  }

  const vehicle = reservation.vehicle
  const rejected =
    reservation.latest_payment?.estado === "fallido"
      ? reservation.latest_payment
      : null
  const amountLabel = formatCurrency(reservation.total_price)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <BackButton
          fallbackHref={`/mis-reservas/${id}`}
          label="Volver a mi reserva"
          icon={<FiArrowLeft />}
          size="default"
          className="-ml-3 rounded-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-sm font-semibold tracking-wider text-muted-foreground">
          {reservation.numero}
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Pagar reserva
        </h1>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          Tu reserva fue aceptada. Elige cómo quieres pagarla para confirmarla.
        </p>
      </div>

      {rejected ? (
        <Alert variant="destructive">
          <AlertTitle>Tu pago anterior fue rechazado</AlertTitle>
          <AlertDescription>
            {rejected.motivo_rechazo ?? "El propietario no pudo verificarlo."}{" "}
            Puedes volver a intentarlo.
          </AlertDescription>
        </Alert>
      ) : null}

      {reservation.payment_due_at ? (
        <Alert>
          <AlertTitle>Tus fechas están apartadas</AlertTitle>
          <AlertDescription>
            Paga o informa tu pago antes del{" "}
            <strong>{formatDeadline(reservation.payment_due_at)}</strong>. Si
            no, la reserva se cancelará automáticamente.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Resumen de la reserva</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Vehículo</p>
              <p className="font-semibold">
                {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Vehículo reservado"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Días</p>
              <p className="font-semibold">{reservation.days}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total a pagar</span>
            <span className="text-2xl font-bold">{amountLabel}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Selecciona tu método de pago</CardTitle>
          <CardDescription>
            El propietario confirmará tu reserva al verificar el pago.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Button
            variant="outline"
            className="h-auto min-h-40 flex-col items-start justify-between gap-6 rounded-2xl p-5 text-left whitespace-normal"
            nativeButton={false}
            render={<Link href={`/mis-reservas/${id}/pagar/transferencia`} />}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon icon={BankIcon} strokeWidth={2} />
            </span>
            <span>
              <span className="block font-semibold">Transferencia bancaria</span>
              <span className="mt-1 block text-sm leading-5 font-normal text-muted-foreground">
                Transfiere a la cuenta del propietario e informa la referencia.
              </span>
            </span>
          </Button>

          <CashPaymentButton reservationId={reservation.id} amountLabel={amountLabel} />
        </CardContent>
      </Card>
    </div>
  )
}
