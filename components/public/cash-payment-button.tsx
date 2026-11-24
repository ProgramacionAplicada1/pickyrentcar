"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Money03Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { reportCashPayment } from "@/app/(public)/mis-reservas/[id]/pagar/actions"

/** Tarjeta "Efectivo al recoger" de la página de métodos de pago. */
export function CashPaymentButton({
  reservationId,
  amountLabel,
}: {
  reservationId: string
  amountLabel: string
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)

  async function handleConfirm() {
    setPending(true)
    const result = await reportCashPayment(reservationId)
    setPending(false)

    if (!result.ok) {
      toast.error("No se pudo registrar el pago en efectivo.", {
        description: result.error,
      })
      return
    }

    setOpen(false)
    toast.success("Listo. Pagarás en efectivo al recoger el vehículo.")
    router.push(`/mis-reservas/${reservationId}`)
    router.refresh()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            className="h-auto min-h-40 flex-col items-start justify-between gap-6 rounded-2xl p-5 text-left whitespace-normal"
          />
        }
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-muted">
          <HugeiconsIcon icon={Money03Icon} strokeWidth={2} />
        </span>
        <span>
          <span className="block font-semibold">Efectivo al recoger</span>
          <span className="mt-1 block text-sm leading-5 font-normal text-muted-foreground">
            Paga {amountLabel} en efectivo cuando te entreguen el vehículo.
          </span>
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Pagar en efectivo al recoger</AlertDialogTitle>
          <AlertDialogDescription>
            El propietario confirmará tu reserva y cobrará {amountLabel} en
            efectivo al entregarte el vehículo. Tus fechas quedarán apartadas
            mientras tanto.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Volver</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={pending}>
            {pending ? <Spinner data-icon="inline-start" /> : null}
            {pending ? "Registrando…" : "Pagaré en efectivo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
