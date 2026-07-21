"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  Calendar01Icon,
  Car01Icon,
  ColorPickerIcon,
  LicenseIcon,
  Note01Icon,
  TagIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import {
  createVehicle,
  updateVehicle,
  type VehicleActionResult,
  type VehicleFieldErrors,
} from "@/app/dashboard/vehicles/actions"
import {
  VEHICLE_STATUSES,
  STATUS_LABELS,
  type VehicleStatus,
} from "@/app/dashboard/vehicles/types"
import type { VehicleFormData } from "@/app/dashboard/vehicles/validations"
import { UploadImage } from "@/components/vehicles/upload-image"

type Props = {
  mode: "create" | "edit"
  vehicleId?: string
  initialData?: VehicleFormData
}

function updateActionWrapper(
  id: string,
  prev: VehicleActionResult | undefined,
  formData: FormData,
) {
  return updateVehicle(id, prev, formData)
}

export function VehicleForm({ mode, vehicleId, initialData }: Props) {
  const [createState, createFormAction, createPending] = useActionState<
    VehicleActionResult | undefined,
    FormData
  >(createVehicle, undefined)

  const [editState, editFormAction, editPending] = useActionState<
    VehicleActionResult | undefined,
    FormData
  >(
    mode === "edit" && vehicleId
      ? updateActionWrapper.bind(null, vehicleId)
      : async () => ({ ok: false, error: "Falta id" }) as VehicleActionResult,
    undefined,
  )

  const state = mode === "create" ? createState : editState
  const formAction = mode === "create" ? createFormAction : editFormAction
  const isPending = mode === "create" ? createPending : editPending

  const [status, setStatus] = React.useState<VehicleStatus>(
    initialData?.status ?? "available",
  )

  const fieldErrors: VehicleFieldErrors =
    state && !state.ok && state.fieldErrors ? state.fieldErrors : {}

  const submitLabel = isPending
    ? mode === "create"
      ? "Creando vehículo…"
      : "Guardando cambios…"
    : mode === "create"
      ? "Crear vehículo"
      : "Guardar cambios"

  const backHref =
    mode === "edit" && vehicleId
      ? `/dashboard/vehicles/${vehicleId}`
      : "/dashboard/vehicles"

  return (
    <form action={formAction} className="flex w-full flex-col gap-4" noValidate>
      {state && !state.ok && state.error && (
        <Alert variant="destructive" className="rounded-2xl">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Field
        id="plate"
        label="Placa"
        icon={<HugeiconsIcon icon={LicenseIcon} strokeWidth={1.5} />}
        error={fieldErrors.plate}
      >
        <Input
          id="plate"
          name="plate"
          type="text"
          autoComplete="off"
          placeholder="ABC-123"
          defaultValue={initialData?.plate}
          disabled={isPending}
          aria-invalid={!!fieldErrors.plate}
          className="h-10 pl-11 uppercase"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="brand"
          label="Marca"
          icon={<HugeiconsIcon icon={Car01Icon} strokeWidth={1.5} />}
          error={fieldErrors.brand}
        >
          <Input
            id="brand"
            name="brand"
            type="text"
            autoComplete="off"
            placeholder="Toyota"
            defaultValue={initialData?.brand}
            disabled={isPending}
            aria-invalid={!!fieldErrors.brand}
            className="h-10 pl-11"
          />
        </Field>

        <Field
          id="model"
          label="Modelo"
          icon={<HugeiconsIcon icon={Car01Icon} strokeWidth={1.5} />}
          error={fieldErrors.model}
        >
          <Input
            id="model"
            name="model"
            type="text"
            autoComplete="off"
            placeholder="Corolla"
            defaultValue={initialData?.model}
            disabled={isPending}
            aria-invalid={!!fieldErrors.model}
            className="h-10 pl-11"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          id="year"
          label="Año"
          icon={<HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} />}
          error={fieldErrors.year}
        >
          <Input
            id="year"
            name="year"
            type="number"
            inputMode="numeric"
            placeholder="2024"
            min={1900}
            max={new Date().getFullYear() + 1}
            defaultValue={initialData?.year}
            disabled={isPending}
            aria-invalid={!!fieldErrors.year}
            className="h-10 pl-11"
          />
        </Field>

        <Field
          id="color"
          label="Color"
          icon={<HugeiconsIcon icon={ColorPickerIcon} strokeWidth={1.5} />}
          error={fieldErrors.color}
        >
          <Input
            id="color"
            name="color"
            type="text"
            autoComplete="off"
            placeholder="Blanco"
            defaultValue={initialData?.color ?? ""}
            disabled={isPending}
            aria-invalid={!!fieldErrors.color}
            className="h-10 pl-11"
          />
        </Field>

        <Field
          id="seats"
          label="Asientos"
          icon={<HugeiconsIcon icon={UserIcon} strokeWidth={1.5} />}
          error={fieldErrors.seats}
        >
          <Input
            id="seats"
            name="seats"
            type="number"
            inputMode="numeric"
            defaultValue={initialData?.seats ?? 5}
            min={1}
            max={50}
            disabled={isPending}
            aria-invalid={!!fieldErrors.seats}
            className="h-10 pl-11"
          />
        </Field>
      </div>

      <Field
        id="status"
        label="Estado"
        icon={<HugeiconsIcon icon={TagIcon} strokeWidth={1.5} />}
        error={fieldErrors.status}
      >
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as VehicleStatus)}
          disabled={isPending}
        >
          <SelectTrigger
            id="status"
            className="h-10 rounded-full pl-10"
            aria-invalid={!!fieldErrors.status}
            size="default"
          >
            <SelectValue>{STATUS_LABELS[status]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {VEHICLE_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="status" value={status} />
      </Field>

      <Field
        id="notes"
        label="Notas"
        icon={<HugeiconsIcon icon={Note01Icon} strokeWidth={1.5} />}
        error={fieldErrors.notes}
      >
        <Textarea
          id="notes"
          name="notes"
          placeholder="Información adicional del vehículo (opcional)"
          defaultValue={initialData?.notes ?? ""}
          disabled={isPending}
          aria-invalid={!!fieldErrors.notes}
          rows={3}
          className="pl-11"
        />
      </Field>

      <UploadImage
        error={fieldErrors.image_url ?? undefined}
        defaultUrl={initialData?.image_url}
      />

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="rounded-full"
          nativeButton={false}
          render={<Link href={backHref} />}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="default"
          size="lg"
          className="rounded-full"
          disabled={isPending}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  icon,
  error,
  children,
}: {
  id: string
  label: string
  icon: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label
        htmlFor={id}
        className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5 text-muted-foreground [&_svg]:size-[18px]">
          {icon}
        </div>
        {children}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
