"use client"

import * as React from "react"
import { useActionState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, Calendar01Icon, Mail01Icon, Note01Icon, TelephoneIcon, Tick02Icon, UserIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/utils/formatCurrency"

import {
  createPublicReservation,
  type PublicReservationResult,
} from "@/app/(public)/catalogo/[vehicleId]/reservar/actions"

type Props = {
  vehicleId: string
  vehicleLabel: string
  dailyPrice: number
  initialStartDate: string
  initialEndDate: string
}

export function ReservationForm({
  vehicleId,
  vehicleLabel,
  dailyPrice,
  initialStartDate,
  initialEndDate,
}: Props) {
  const startDate = parseLocalDate(initialStartDate)
  const endDate = parseLocalDate(initialEndDate)

  const days = React.useMemo(() => {
    if (!startDate || !endDate) return 0
    const diff = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    )
    return diff >= 0 ? diff + 1 : 0
  }, [startDate, endDate])

  const total = days * Number(dailyPrice)

  const [state, formAction, isPending] = useActionState<
    PublicReservationResult | undefined,
    FormData
  >(createPublicReservation, undefined)

  const fieldErrors =
    state && !state.ok && state.fieldErrors ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="vehicle_id" value={vehicleId} />
      <input type="hidden" name="start_date" value={initialStartDate} />
      <input type="hidden" name="end_date" value={initialEndDate} />
      <input type="hidden" name="daily_price" value={dailyPrice} />

      {state && !state.ok && state.error && (
        <Alert variant="destructive" className="rounded-2xl">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
          <AlertTitle>No se pudo crear la reserva</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={!!fieldErrors?.client_name}>
          <FieldLabel htmlFor="client_name">Nombre completo</FieldLabel>
          <div className="relative">
            <HugeiconsIcon
              icon={UserIcon}
              strokeWidth={1.5}
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="client_name"
              name="client_name"
              type="text"
              autoComplete="name"
              required
              placeholder="Juan Pérez"
              disabled={isPending}
              aria-invalid={!!fieldErrors?.client_name}
              className="pl-10"
            />
          </div>
          {fieldErrors?.client_name && (
            <FieldError>{fieldErrors.client_name}</FieldError>
          )}
        </Field>

        <Field data-invalid={!!fieldErrors?.client_email}>
          <FieldLabel htmlFor="client_email">Correo electrónico</FieldLabel>
          <div className="relative">
            <HugeiconsIcon
              icon={Mail01Icon}
              strokeWidth={1.5}
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="client_email"
              name="client_email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@correo.com"
              disabled={isPending}
              aria-invalid={!!fieldErrors?.client_email}
              className="pl-10"
            />
          </div>
          {fieldErrors?.client_email && (
            <FieldError>{fieldErrors.client_email}</FieldError>
          )}
        </Field>

        <Field data-invalid={!!fieldErrors?.client_phone}>
          <FieldLabel htmlFor="client_phone">Teléfono</FieldLabel>
          <div className="relative">
            <HugeiconsIcon
              icon={TelephoneIcon}
              strokeWidth={1.5}
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="client_phone"
              name="client_phone"
              type="tel"
              autoComplete="tel"
              required
              placeholder="(809) 555-1234"
              disabled={isPending}
              aria-invalid={!!fieldErrors?.client_phone}
              className="pl-10"
            />
          </div>
          {fieldErrors?.client_phone && (
            <FieldError>{fieldErrors.client_phone}</FieldError>
          )}
        </Field>

        <Field data-invalid={!!fieldErrors?.notes}>
          <FieldLabel htmlFor="notes">Notas (opcional)</FieldLabel>
          <div className="relative">
            <HugeiconsIcon
              icon={Note01Icon}
              strokeWidth={1.5}
              className="pointer-events-none absolute top-3 left-3.5 size-4 text-muted-foreground"
            />
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              disabled={isPending}
              aria-invalid={!!fieldErrors?.notes}
              placeholder="Lugar de entrega, hora estimada, etc."
              className="pl-10"
            />
          </div>
          {fieldErrors?.notes && (
            <FieldError>{fieldErrors.notes}</FieldError>
          )}
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-3 rounded-2xl border bg-muted/30 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Vehículo</span>
          <span className="font-medium">{vehicleLabel}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tarifa diaria</span>
          <span className="font-medium">{formatCurrency(Number(dailyPrice))}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Días</span>
          <span className="font-medium">{days > 0 ? days : "—"}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-base font-semibold">Total estimado</span>
          <span className="text-xl font-bold">
            {days > 0 ? formatCurrency(total) : "—"}
          </span>
        </div>
        <FieldDescription>
          El pago del avance se coordina directamente con el proveedor. Tu
          reserva quedará en estado <strong>Pendiente</strong> hasta confirmar
          el anticipo.
        </FieldDescription>
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        disabled={isPending || days === 0}
        className="w-full rounded-full"
      >
        {isPending ? (
          <>
            <Spinner />
            Enviando reserva…
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
            Confirmar reserva
          </>
        )}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <HugeiconsIcon
          icon={Calendar01Icon}
          strokeWidth={1.75}
          className="size-3"
        />
        Recibirás un correo con la confirmación.
      </p>
    </form>
  )
}

function parseLocalDate(value: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split("-").map(Number)
  if (!y || !m || !d) return null
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? null : date
}