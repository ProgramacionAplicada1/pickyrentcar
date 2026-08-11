import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/services/auth";
import { getMyReservationById } from "@/services/my-reservations";
import { formatCurrency } from "@/lib/utils/formatCurrency";

export const metadata: Metadata = { title: "Pagar reserva · PickyRentCar" }

type Props = { params: Promise<{ id: string }> }

export default async function PagarReservacion({ params }: Props) {
  
    const user = await getCurrentUser()

  const { id } = await params

  if (!user) {  redirect(`/login?next=${encodeURIComponent(`/mis-reservas/${id}/pagar`)}`) }

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

  const vehicle = reservation.vehicle


    
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <Button
          variant="ghost"
          className="-ml-3 rounded-full"
          nativeButton={false}
          render={<Link href={`/mis-reservas/${id}`} />}
        >
          <FiArrowLeft />
          Volver a mi reserva
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-sm font-semibold tracking-wider text-muted-foreground">
          {reservation.numero}
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Pagar reserva
        </h1>

        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          Tu reserva fue aceptada. Selecciona el metodo de pago que deseas
          utilizar para activar tu reserva.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Resumen de la reserva</CardTitle>
        </CardHeader>


        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Vehiculo</p>
              <p className="font-semibold">
                {vehicle
                  ? `${vehicle.brand} ${vehicle.model}`
                  : "Vehículo reservado"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">Reserva</p>
              <p className="font-mono text-sm font-semibold">
                {reservation.numero}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total a pagar</span>

              <span className="text-2xl font-bold">
                {formatCurrency(reservation.total_price)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Selecciona tu metodo de pago</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 sm:grid-cols-2">
          <PaymentMethodCard
            title="Transferencia bancaria"
            description="Realiza una transferencia a la cuenta bancaria de PickyRentCar."
            href={`/mis-reservas/${id}/pagar/transferencia`}
          />
        </CardContent>
      </Card>
    </div>
  );
}




function PaymentMethodCard({
  title, description, href,
    }: {
  title: string,
  description: string,
  href: string,
}) {
  return (
    <Button
      variant="outline"
      className="h-auto min-h-40 flex-col items-start justify-between gap-6 rounded-2xl p-5 text-left whitespace-normal"
      nativeButton={false}
      render={<Link href={href} />}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <FiCheck className="size-5" />
      </div>

      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-1 text-sm font-normal leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </Button>
  );
}
