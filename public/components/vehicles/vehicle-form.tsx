"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

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
import { UploadImages } from "@/components/vehicles/upload-images"
import {
  VEHICLE_BRANDS,
  VEHICLE_CATEGORIES,
  VEHICLE_COLORS,
  VEHICLE_FUEL_TYPES,
  VEHICLE_TRANSMISSIONS,
  getModelsForBrand,
  type VehicleBrand,
} from "@/lib/vehicles/catalog"

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

  const initialBrand = (initialData?.brand ??
    VEHICLE_BRANDS[0]) as VehicleBrand
  const [brand, setBrand] = React.useState<VehicleBrand>(initialBrand)
  const modelsForBrand = React.useMemo(() => getModelsForBrand(brand), [brand])

  const initialModel =
    initialData?.model && modelsForBrand.includes(initialData.model)
      ? initialData.model
      : (modelsForBrand[0] ?? "")
  const [model, setModel] = React.useState<string>(initialModel)
  const [prevBrand, setPrevBrand] = React.useState<VehicleBrand>(initialBrand)
  if (prevBrand !== brand) {
    setPrevBrand(brand)
    if (!modelsForBrand.includes(model)) {
      setModel(modelsForBrand[0] ?? "")
    }
  }

  const [status, setStatus] = React.useState<VehicleStatus>(
    initialData?.status ?? "available",
  )

  const [color, setColor] = React.useState<string>(initialData?.color ?? "")
  const [transmission, setTransmission] = React.useState<string>(
    initialData?.transmission ?? VEHICLE_TRANSMISSIONS[0],
  )
  const [fuelType, setFuelType] = React.useState<string>(
    initialData?.fuel_type ?? VEHICLE_FUEL_TYPES[0],
  )
  const [category, setCategory] = React.useState<string>(
    initialData?.category ?? VEHICLE_CATEGORIES[0],
  )

  const fieldErrors: VehicleFieldErrors =
    state && !state.ok && state.fieldErrors ? state.fieldErrors : {}

  const submitLabel = isPending
    ? mode === "create"
      ? "Creando…"
      : "Guardando…"
    : mode === "create"
      ? "Crear vehículo"
      : "Guardar cambios"

  const backHref =
    mode === "edit" && vehicleId
      ? `/dashboard/vehicles/${vehicleId}`
      : "/dashboard/vehicles"

  return (
    <form action={formAction} className="flex w-full flex-col gap-6" noValidate>
      {state && !state.ok && state.error && (
        <Alert variant="destructive" className="rounded-2xl">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={!!fieldErrors.nombre}>
          <FieldLabel htmlFor="nombre">Nombre (opcional)</FieldLabel>
          <Input
            id="nombre"
            name="nombre"
            type="text"
            placeholder="La Bestia"
            defaultValue={initialData?.nombre ?? ""}
            disabled={isPending}
            aria-invalid={!!fieldErrors.nombre}
            maxLength={60}
          />
          <FieldDescription>
            Un apodo o nombre de cariño para identificar el vehículo.
          </FieldDescription>
          {fieldErrors.nombre && <FieldError>{fieldErrors.nombre}</FieldError>}
        </Field>

        <Field data-invalid={!!fieldErrors.plate}>
          <FieldLabel htmlFor="plate">Placa</FieldLabel>
          <Input
            id="plate"
            name="plate"
            type="text"
            autoComplete="off"
            placeholder="ABC-123"
            defaultValue={initialData?.plate}
            disabled={isPending}
            aria-invalid={!!fieldErrors.plate}
            className="uppercase"
          />
          {fieldErrors.plate && <FieldError>{fieldErrors.plate}</FieldError>}
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!fieldErrors.brand}>
            <FieldLabel htmlFor="brand">Marca</FieldLabel>
            <Select
              value={brand}
              onValueChange={(value) => setBrand(value as VehicleBrand)}
              disabled={isPending}
            >
              <SelectTrigger
                id="brand"
                aria-invalid={!!fieldErrors.brand}
                size="default"
              >
                <SelectValue>{brand}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_BRANDS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="brand" value={brand} />
            {fieldErrors.brand && <FieldError>{fieldErrors.brand}</FieldError>}
          </Field>

          <Field data-invalid={!!fieldErrors.model}>
            <FieldLabel htmlFor="model">Modelo</FieldLabel>
            <Select
              value={model}
              onValueChange={(value) => setModel(value ?? "")}
              disabled={isPending}
            >
              <SelectTrigger
                id="model"
                aria-invalid={!!fieldErrors.model}
                size="default"
              >
                <SelectValue>{model}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {modelsForBrand.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="model" value={model} />
            {fieldErrors.model && <FieldError>{fieldErrors.model}</FieldError>}
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Field data-invalid={!!fieldErrors.year}>
            <FieldLabel htmlFor="year">Año</FieldLabel>
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
            />
            {fieldErrors.year && <FieldError>{fieldErrors.year}</FieldError>}
          </Field>

          <Field data-invalid={!!fieldErrors.color}>
            <FieldLabel htmlFor="color">Color</FieldLabel>
            <Select
              value={color}
              onValueChange={(value) => setColor(value ?? "")}
              disabled={isPending}
            >
              <SelectTrigger
                id="color"
                aria-invalid={!!fieldErrors.color}
                size="default"
              >
                <SelectValue placeholder="Selecciona un color">
                  {color || "Selecciona un color"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_COLORS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="color" value={color} />
            {fieldErrors.color && <FieldError>{fieldErrors.color}</FieldError>}
          </Field>

          <Field data-invalid={!!fieldErrors.seats}>
            <FieldLabel htmlFor="seats">Asientos</FieldLabel>
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
            />
            {fieldErrors.seats && <FieldError>{fieldErrors.seats}</FieldError>}
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Field data-invalid={!!fieldErrors.transmission}>
            <FieldLabel htmlFor="transmission">Transmisión</FieldLabel>
            <Select
              value={transmission}
              onValueChange={(value) => setTransmission(value ?? "")}
              disabled={isPending}
            >
              <SelectTrigger
                id="transmission"
                aria-invalid={!!fieldErrors.transmission}
                size="default"
              >
                <SelectValue>{transmission}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TRANSMISSIONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="transmission" value={transmission} />
            {fieldErrors.transmission && (
              <FieldError>{fieldErrors.transmission}</FieldError>
            )}
          </Field>

          <Field data-invalid={!!fieldErrors.fuel_type}>
            <FieldLabel htmlFor="fuel_type">Combustible</FieldLabel>
            <Select
              value={fuelType}
              onValueChange={(value) => setFuelType(value ?? "")}
              disabled={isPending}
            >
              <SelectTrigger
                id="fuel_type"
                aria-invalid={!!fieldErrors.fuel_type}
                size="default"
              >
                <SelectValue>{fuelType}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_FUEL_TYPES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="fuel_type" value={fuelType} />
            {fieldErrors.fuel_type && (
              <FieldError>{fieldErrors.fuel_type}</FieldError>
            )}
          </Field>

          <Field data-invalid={!!fieldErrors.category}>
            <FieldLabel htmlFor="category">Categoría</FieldLabel>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value ?? "")}
              disabled={isPending}
            >
              <SelectTrigger
                id="category"
                aria-invalid={!!fieldErrors.category}
                size="default"
              >
                <SelectValue>{category}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_CATEGORIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="category" value={category} />
            {fieldErrors.category && (
              <FieldError>{fieldErrors.category}</FieldError>
            )}
          </Field>
        </div>

        <Field data-invalid={!!fieldErrors.daily_price}>
          <FieldLabel htmlFor="daily_price">Precio por día (RD$)</FieldLabel>
          <Input
            id="daily_price"
            name="daily_price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0}
            placeholder="2500"
            defaultValue={initialData?.daily_price ?? 0}
            disabled={isPending}
            aria-invalid={!!fieldErrors.daily_price}
          />
          <FieldDescription>
            Tarifa diaria en pesos dominicanos. Se mostrará en el catálogo.
          </FieldDescription>
          {fieldErrors.daily_price && (
            <FieldError>{fieldErrors.daily_price}</FieldError>
          )}
        </Field>

        <Field data-invalid={!!fieldErrors.status}>
          <FieldLabel htmlFor="status">Estado</FieldLabel>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as VehicleStatus)}
            disabled={isPending}
          >
            <SelectTrigger
              id="status"
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
          {fieldErrors.status && <FieldError>{fieldErrors.status}</FieldError>}
        </Field>

        <Field data-invalid={!!fieldErrors.notes}>
          <FieldLabel htmlFor="notes">Notas</FieldLabel>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Información adicional del vehículo (opcional)"
            defaultValue={initialData?.notes ?? ""}
            disabled={isPending}
            aria-invalid={!!fieldErrors.notes}
            rows={3}
          />
          {fieldErrors.notes && <FieldError>{fieldErrors.notes}</FieldError>}
        </Field>

        <UploadImages
          error={fieldErrors.images}
          defaultUrls={initialData?.image_urls ?? []}
        />
      </FieldGroup>

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
          {isPending && <Spinner />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}