import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"

import { CopyButton } from "@/components/public/copy-button"
import PaymentReportButton from "@/components/public/boton-transferencia"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BackButton } from "@/components/ui/back-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import { getCurrentUser } from "@/services/auth"
import { getMyReservationById } from "@/services/my-reservations"
import { getPaymentDetails } from "@/services/payments"

export const metadata: Metadata = { title: "Transferencia bancaria · PickyRentCar" }

type Props = { params: Promise<{ id: string }> }

export default async function TransferPaymentPage({ params }: Props) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/mis-reservas/${id}/pagar/transferencia`)}`)
  }
  if (user.role === "admin") {
    redirect("/dashboard")
  }

  const reservation = await getMyReservationById(id)
  if (!reservation) notFound()
  if (reservation.status !== "pendiente_pago") {
    redirect(`/mis-reservas/${id}`)
  }

  const details = await getPaymentDetails(reservation.id)
  const hasBankDetails = Boolean(details?.banco && details?.numero_cuenta)
  const alreadyReported = reservation.latest_payment?.estado === "pendiente"

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <BackButton
          fallbackHref={`/mis-reservas/${id}/pagar`}
          label="Volver a métodos de pago"
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
          Transferencia bancaria
        </h1>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          Transfiere el monto exacto a la cuenta del propietario del vehículo y
          luego infórmanos el número de referencia.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Monto a transferir</CardTitle>
          <CardDescription>Total de tu reserva.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold tracking-tight">
            {formatCurrency(reservation.total_price)}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Datos bancarios</CardTitle>
          <CardDescription>
            Cuenta del propietario del vehículo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {hasBankDetails && details ? (
            <>
              <BankDetail label="Banco" value={details.banco} />
              <BankDetail label="Titular" value={details.titular_cuenta} />
              <BankDetail label="Número de cuenta" value={details.numero_cuenta} copyable />
              <BankDetail label="Tipo de cuenta" value={details.tipo_cuenta} />
            </>
          ) : (
            <Alert>
              <AlertTitle>Datos bancarios no disponibles</AlertTitle>
              <AlertDescription>
                El propietario aún no configuró su cuenta bancaria. Puedes
                elegir pagar en efectivo al recoger el vehículo o contactar al
                propietario.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Informar la transferencia</CardTitle>
          <CardDescription>
            El propietario verificará el pago y confirmará tu reserva. Mientras
            lo revisa, tus fechas quedan apartadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentReportButton
            reservationId={reservation.id}
            userId={user.id}
            initiallyReported={alreadyReported}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function BankDetail({
  label,
  value,
  copyable = false,
}: {
  label: string
  value: string | null
  copyable?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border p-4">
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="mt-1 truncate font-semibold">{value || "—"}</p>
      </div>
      {copyable && value ? <CopyButton value={value} label={label} /> : null}
    </div>
  )
}
