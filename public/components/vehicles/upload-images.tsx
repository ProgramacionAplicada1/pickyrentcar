"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Camera01Icon,
  Cancel01Icon,
  Image01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { MAX_VEHICLE_IMAGES } from "@/app/dashboard/vehicles/types"

type SlotState = {
  file: File | null
  preview: string | null
  remoteUrl: string | null
  filename: string | null
}

type Props = {
  namePrefix?: string
  error?: string
  defaultUrls?: string[]
}

function emptySlot(): SlotState {
  return { file: null, preview: null, remoteUrl: null, filename: null }
}

export function UploadImages({
  namePrefix = "",
  error,
  defaultUrls = [],
}: Props) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const fileName = (slot: number) =>
    `${namePrefix}image_file_${slot}`.replace(/^_+/, "")
  const urlName = (slot: number) =>
    `${namePrefix}image_url_${slot}`.replace(/^_+/, "")

  const [slots, setSlots] = React.useState<SlotState[]>(() => {
    return Array.from({ length: MAX_VEHICLE_IMAGES }, (_, i) => {
      const url = defaultUrls[i] ?? null
      return { ...emptySlot(), remoteUrl: url }
    })
  })

  React.useEffect(() => {
    return () => {
      slots.forEach((s) => {
        if (s.preview?.startsWith("blob:")) URL.revokeObjectURL(s.preview)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFileChange(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    setSlots((prev) => {
      const next = [...prev]
      if (next[index].preview?.startsWith("blob:")) {
        URL.revokeObjectURL(next[index].preview!)
      }
      next[index] = {
        file,
        preview: URL.createObjectURL(file),
        remoteUrl: null,
        filename: file.name,
      }
      return next
    })
  }

  function handleRemove(index: number) {
    setSlots((prev) => {
      const next = [...prev]
      if (next[index].preview?.startsWith("blob:")) {
        URL.revokeObjectURL(next[index].preview!)
      }
      next[index] = emptySlot()
      return next
    })
    if (inputRefs.current[index]) inputRefs.current[index]!.value = ""
  }

  function handleOpenPicker(index: number) {
    inputRefs.current[index]?.click()
  }

  const filledCount = slots.filter(
    (s) => s.file || s.preview || s.remoteUrl,
  ).length

  return (
    <div className="flex flex-col gap-3">
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

      <input
        ref={(el) => {
          inputRefs.current[0] = el
        }}
        type="file"
        name={fileName(1)}
        accept="image/*"
        onChange={(e) => handleFileChange(0, e)}
        className="hidden"
        aria-label="Imagen 1 del vehículo"
      />
      <input
        ref={(el) => {
          inputRefs.current[1] = el
        }}
        type="file"
        name={fileName(2)}
        accept="image/*"
        onChange={(e) => handleFileChange(1, e)}
        className="hidden"
        aria-label="Imagen 2 del vehículo"
      />
      <input
        ref={(el) => {
          inputRefs.current[2] = el
        }}
        type="file"
        name={fileName(3)}
        accept="image/*"
        onChange={(e) => handleFileChange(2, e)}
        className="hidden"
        aria-label="Imagen 3 del vehículo"
      />
      <input
        ref={(el) => {
          inputRefs.current[3] = el
        }}
        type="file"
        name={fileName(4)}
        accept="image/*"
        onChange={(e) => handleFileChange(3, e)}
        className="hidden"
        aria-label="Imagen 4 del vehículo"
      />
      <input
        ref={(el) => {
          inputRefs.current[4] = el
        }}
        type="file"
        name={fileName(5)}
        accept="image/*"
        onChange={(e) => handleFileChange(4, e)}
        className="hidden"
        aria-label="Imagen 5 del vehículo"
      />

      {slots.map((slot, i) => (
        <SlotUrlField key={i} name={urlName(i + 1)} url={slot.remoteUrl} />
      ))}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {slots.map((slot, i) => (
          <SlotTile
            key={i}
            slot={slot}
            index={i + 1}
            onOpen={() => handleOpenPicker(i)}
            onRemove={() => handleRemove(i)}
          />
        ))}
      </div>

      {error && <FieldError>{error}</FieldError>}
      {!error && filledCount === 0 && (
        <FieldDescription>
          Sube hasta {MAX_VEHICLE_IMAGES} imágenes. La primera será la portada.
        </FieldDescription>
      )}
    </div>
  )
}

function SlotUrlField({ name, url }: { name: string; url: string | null }) {
  return (
    <input
      type="hidden"
      name={name}
      value={url ?? ""}
      data-slot-url={name}
    />
  )
}

type SlotTileProps = {
  slot: SlotState
  index: number
  onOpen: () => void
  onRemove: () => void
}

function SlotTile({ slot, index, onOpen, onRemove }: SlotTileProps) {
  const hasImage = Boolean(slot.preview || slot.remoteUrl)
  const isFirst = index === 1

  if (!hasImage) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "group relative flex aspect-square w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border border-dashed border-input bg-input/20 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-input/40 hover:text-foreground",
          isFirst && "ring-2 ring-primary/10",
        )}
        aria-label={`Subir imagen ${index}`}
      >
        <HugeiconsIcon
          icon={isFirst ? Camera01Icon : PlusSignIcon}
          strokeWidth={1.75}
          className="size-5"
        />
        <span className="text-[10px] font-medium tracking-wide uppercase">
          {isFirst ? "Portada" : `Imagen ${index}`}
        </span>
      </button>
    )
  }

  return (
    <div
      className={cn(
        "group/slot relative overflow-hidden rounded-2xl border border-input bg-muted/30",
        isFirst && "ring-2 ring-primary/30",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slot.preview ?? slot.remoteUrl ?? ""}
        alt={`Imagen ${index}`}
        className="aspect-square w-full object-cover"
      />
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
            className="size-4"
          />
        </Button>
      </div>
      {isFirst && (
        <span className="absolute top-1.5 left-1.5 rounded-full bg-primary/95 px-2 py-0.5 text-[10px] font-medium tracking-wide text-primary-foreground uppercase">
          Portada
        </span>
      )}
    </div>
  )
}