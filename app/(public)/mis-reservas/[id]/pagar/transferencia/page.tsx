import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FiArrowLeft, FiCopy } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { getCurrentUser } from "@/services/auth";
import { getMyReservationById } from "@/services/my-reservations";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import PaymentReportButton from "@/components/public/boton-transferencia";


export const metadata: Metadata = { title: "Transferencia bancaria · PickyRentCar" }

type Props = { params: Promise<{ id: string }> }

export default async function TransferPaymentPage({ params }: Props) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/mis-reservas/${id}/pagar/transferencia`,
      )}`,
    );
  }



  if (user.role === "admin") {
      redirect("/dashboard")
  }



  const reservation = await getMyReservationById(id)


  if (!reservation) {
    notFound()
  }


  if (reservation.status !== "pendiente_pago") {
    redirect(`/mis-reservas/${id}`)
  }

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
          Realiza la transferencia por el monto exacto de tu reserva utilizando
          los datos bancarios indicados debajo.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Monto a transferir</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-3xl font-bold tracking-tight">
            {formatCurrency(reservation.total_price)}
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Este es el monto total de tu reserva.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Datos bancarios</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <BankDetail label="Banco" value="PENDIENTE DE CONFIGURAR" />
          <BankDetail label="Titular" value="PickyRentCar" />
          <BankDetail
            label="Número de cuenta"
            value="PENDIENTE DE CONFIGURAR"
          />
          <BankDetail label="Tipo de cuenta" value="PENDIENTE DE CONFIGURAR" />

          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-sm font-medium">Importante</p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Despues de realizar la transferencia, informa al administrador. La
              reserva permanecerá pendiente de pago hasta que el administrador
              confirme que recibió el dinero.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardContent className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="font-semibold">¿Ya realizaste la transferencia?</h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              El administrador verificara la transferencia antes de activar tu
              reserva
            </p>
          </div>
          <PaymentReportButton reservationId={reservation.id} />
        </CardContent>
      </Card>
    </div>
  )
}




function BankDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border p-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 font-semibold">{value}</p>
      </div>

      <button
        type="button"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition hover:bg-muted"
        title={`Copiar ${label.toLowerCase()}`}
      >
        <FiCopy className="size-4" />
      </button>
    </div>
  );
}
