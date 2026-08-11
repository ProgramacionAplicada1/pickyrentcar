"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  Camera01Icon,
  Cancel01Icon,
  Image01Icon,
  PlusSignIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { MAX_VEHICLE_IMAGES } from "@/app/dashboard/vehicles/types"
import {
  uploadVehicleImage,
  type UploadError,
} from "@/lib/storage/upload-client"

type SlotState = {
  file: File | null
  preview: string | null
  remoteUrl: string | null
  clientUploadedPath: string | null
  uploading: boolean
  progress: number
  error: string | null
}

type Props = {
  namePrefix?: string
  error?: string
  defaultUrls?: string[]
}

function emptySlot(): SlotState {
  return {
    file: null,
    preview: null,
    remoteUrl: null,
    clientUploadedPath: null,
    uploading: false,
    progress: 0,
    error: null,
  }
}

function isUploadError(value: unknown): value is UploadError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value
  )
}

export function UploadImages({
  namePrefix = "",
  error,
  defaultUrls = [],
}: Props) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const slotsRef = React.useRef<SlotState[]>([])
  const urlName = (slot: number) =>
    `${namePrefix}image_url_${slot}`.replace(/^_+/, "")

  const [slots, setSlots] = React.useState<SlotState[]>(() => {
    return Array.from({ length: MAX_VEHICLE_IMAGES }, (_, i) => {
      const url = defaultUrls[i] ?? null
      return { ...emptySlot(), remoteUrl: url }
    })
  })

  React.useEffect(() => {
    slotsRef.current = slots
  }, [slots])

  React.useEffect(() => {
    const sendCleanupBeacon = (paths: string[]) => {
      if (paths.length === 0) return
      try {
        const blob = new Blob([JSON.stringify({ paths })], {
          type: "application/json",
        })
        navigator.sendBeacon("/api/storage/cleanup", blob)
      } catch {
        /* silent */
      }
    }
    const onBeforeUnload = () => {
      const paths = slotsRef.current
        .map((s) => s.clientUploadedPath)
        .filter((p): p is string => Boolean(p))
      sendCleanupBeacon(paths)
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [])

  React.useEffect(() => {
    return () => {
      slotsRef.current.forEach((s) => {
        if (s.preview?.startsWith("blob:")) URL.revokeObjectURL(s.preview)
      })
    }
  }, [])

  function updateSlot(index: number, patch: Partial<SlotState>) {
    setSlots((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...patch }
      return next
    })
  }

  async function runUpload(index: number, file: File) {
    updateSlot(index, { uploading: true, progress: 0, error: null })
    try {
      const result = await uploadVehicleImage(file, index + 1, (pct) => {
        updateSlot(index, { progress: pct })
      })
      updateSlot(index, {
        remoteUrl: result.publicUrl,
        clientUploadedPath: result.path,
        uploading: false,
        progress: 100,
      })
    } catch (err: unknown) {
      const message = isUploadError(err)
        ? err.message
        : "No se pudo subir la imagen. Inténtalo de nuevo."
      updateSlot(index, {
        uploading: false,
        error: message,
      })
    } finally {
      if (inputRefs.current[index]) inputRefs.current[index]!.value = ""
    }
  }

  async function handleFileChange(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return

    const current = slotsRef.current[index]
    if (current.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(current.preview)
    }
    const preview = URL.createObjectURL(file)
    updateSlot(index, {
      file,
      preview,
      remoteUrl: null,
      clientUploadedPath: null,
    })
    await runUpload(index, file)
  }

  function handleRetry(index: number) {
    const current = slotsRef.current[index]
    if (!current.file) return
    void runUpload(index, current.file)
  }

  function handleRemove(index: number) {
    const current = slotsRef.current[index]
    const uploadedPath = current.clientUploadedPath
    if (current.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(current.preview)
    }
    updateSlot(index, emptySlot())
    if (inputRefs.current[index]) inputRefs.current[index]!.value = ""

    if (uploadedPath) {
      try {
        const blob = new Blob(
          [JSON.stringify({ paths: [uploadedPath] })],
          { type: "application/json" },
        )
        navigator.sendBeacon("/api/storage/cleanup", blob)
      } catch {
        /* silent */
      }
    }
  }

  function handleOpenPicker(index: number) {
    inputRefs.current[index]?.click()
  }

  const filledCount = slots.filter(
    (s) => s.file || s.preview || s.remoteUrl,
  ).length

  const slotErrors = slots.map((s) => s.error).filter(Boolean) as string[]
  const hasAnyError = Boolean(error) || slotErrors.length > 0

  const uploadedPaths = slots
    .map((s) => s.clientUploadedPath)
    .filter((p): p is string => Boolean(p))

  return (
    <FieldGroup>
      <Field data-invalid={hasAnyError}>
        <div className="flex items-center justify-between">
          <FieldLabel className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Imágenes ({filledCount}/{MAX_VEHICLE_IMAGES})
          </FieldLabel>
          {filledCount > 0 && (
            <span className="text-xs text-muted-foreground">
              Reemplaza o quita cualquier imagen individualmente
            </span>
          )}
        </div>

        {slots.map((slot, i) => (
          <React.Fragment key={i}>
            <input
              ref={(el) => {
                inputRefs.current[i] = el
              }}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(i, e)}
              className="hidden"
              aria-label={`Imagen ${i + 1} del vehículo`}
              tabIndex={-1}
            />
            <input
              type="hidden"
              name={urlName(i + 1)}
              value={slot.remoteUrl ?? ""}
              data-slot-url={urlName(i + 1)}
            />
          </React.Fragment>
        ))}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {slots.map((slot, i) => (
            <SlotTile
              key={i}
              slot={slot}
              index={i + 1}
              onOpen={() => handleOpenPicker(i)}
              onRemove={() => handleRemove(i)}
              onRetry={() => handleRetry(i)}
            />
          ))}
        </div>

        {hasAnyError ? (
          <FieldError>
            {error ??
              "Alguna imagen no se pudo subir. Reintenta desde la miniatura."}
          </FieldError>
        ) : (
          filledCount === 0 && (
            <FieldDescription>
              Sube hasta {MAX_VEHICLE_IMAGES} imágenes. La primera será la portada.
            </FieldDescription>
          )
        )}

        {slotErrors.length > 0 && (
          <Alert variant="destructive" className="mt-2">
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
            <AlertDescription>
              Una o más imágenes no se pudieron subir. Usa el botón &quot;Reintentar&quot;
              en cada miniatura afectada.
            </AlertDescription>
          </Alert>
        )}

        <noscript>
          <FieldDescription>
            La subida de imágenes requiere JavaScript habilitado.
          </FieldDescription>
        </noscript>

        <input
          type="hidden"
          name={`${namePrefix.replace(/^_+/, "")}_uploaded_paths`}
          value={JSON.stringify(uploadedPaths)}
          readOnly
        />
      </Field>
    </FieldGroup>
  )
}

type SlotTileProps = {
  slot: SlotState
  index: number
  onOpen: () => void
  onRemove: () => void
  onRetry: () => void
}

function SlotTile({ slot, index, onOpen, onRemove, onRetry }: SlotTileProps) {
  const isFirst = index === 1
  const displayUrl = slot.preview ?? slot.remoteUrl
  const hasImage = Boolean(displayUrl)
  const isError = Boolean(slot.error)
  const isUploading = slot.uploading

  return (
    <div
      className={cn(
        "group/slot relative overflow-hidden rounded-2xl border bg-muted/30",
        isError
          ? "border-destructive/50"
          : isFirst && hasImage
            ? "border-input ring-2 ring-primary/30"
            : "border-input",
        !hasImage && !isUploading && !isError && "border-dashed bg-input/20",
      )}
    >
      {hasImage && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={displayUrl ?? ""}
          alt={`Imagen ${index}`}
          className="aspect-square w-full object-cover"
        />
      )}

      {!hasImage && !isUploading && !isError && (
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "flex aspect-square w-full flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground",
            isFirst && "ring-2 ring-primary/10",
          )}
          aria-label={`Subir imagen ${index}`}
        >
          <HugeiconsIcon
            icon={isFirst ? Camera01Icon : PlusSignIcon}
            strokeWidth={1.75}
            data-icon="inline-start"
            className="size-5"
          />
          <span className="text-[10px] font-medium tracking-wide uppercase">
            {isFirst ? "Portada" : `Imagen ${index}`}
          </span>
        </button>
      )}

      {isUploading && (
        <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 p-3 text-muted-foreground">
          <Spinner />
          <Progress value={slot.progress} className="w-full max-w-full" />
          <span className="text-[10px] font-medium tracking-wide tabular-nums">
            {slot.progress}%
          </span>
        </div>
      )}

      {isError && (
        <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 p-3 text-destructive">
          <HugeiconsIcon
            icon={Alert02Icon}
            strokeWidth={2}
            data-icon="inline-start"
            className="size-5"
          />
          <span className="text-center text-[10px] font-medium leading-tight">
            Error al subir
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={!slot.file}
            className="h-7"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            Reintentar
          </Button>
        </div>
      )}

      {hasImage && !isUploading && !isError && (
        <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/55 opacity-0 transition-opacity group-hover/slot:opacity-100">
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            onClick={onOpen}
            aria-label={`Reemplazar imagen ${index}`}
          >
            <HugeiconsIcon
              icon={Image01Icon}
              strokeWidth={2}
              data-icon="inline-start"
              className="size-4"
            />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            onClick={onRemove}
            aria-label={`Quitar imagen ${index}`}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              strokeWidth={2}
              data-icon="inline-start"
              className="size-4"
            />
          </Button>
        </div>
      )}

      {isFirst && hasImage && !isError && (
        <span className="absolute top-1.5 left-1.5 rounded-full bg-primary/95 px-2 py-0.5 text-[10px] font-medium tracking-wide text-primary-foreground uppercase">
          Portada
        </span>
      )}
    </div>
  )
}