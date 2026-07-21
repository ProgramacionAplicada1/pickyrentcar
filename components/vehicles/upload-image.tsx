"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Camera01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"

import { Label } from "@/components/ui/label"

type Props = {
  name?: string
  error?: string
  defaultUrl?: string | null
}

export function UploadImage({ name = "image_file", error, defaultUrl }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [preview, setPreview] = React.useState<string | null>(
    defaultUrl ?? null,
  )
  const [filename, setFilename] = React.useState<string | null>(null)
  const [isDefaultPreview, setIsDefaultPreview] = React.useState<boolean>(
    Boolean(defaultUrl),
  )

  React.useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview)
    setFilename(file.name)
    setPreview(URL.createObjectURL(file))
    setIsDefaultPreview(false)
  }

  function handleClear() {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview)
    setPreview(defaultUrl ?? null)
    setFilename(null)
    setIsDefaultPreview(Boolean(defaultUrl))
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        Imagen del vehículo
      </Label>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        aria-label="Subir imagen del vehículo"
      />
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-input bg-input/30 px-4 text-sm font-medium text-foreground transition-colors hover:bg-input/50"
        >
          <HugeiconsIcon
            icon={Camera01Icon}
            strokeWidth={1.75}
            className="size-4"
          />
          {preview && !isDefaultPreview
            ? "Cambiar imagen"
            : preview
              ? "Reemplazar imagen"
              : "Subir imagen"}
        </button>
        {filename && (
          <span className="truncate text-xs text-muted-foreground">
            {filename}
          </span>
        )}
        {preview && !isDefaultPreview && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Quitar imagen"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </button>
        )}
      </div>
      {preview && (
        <div className="mt-1 overflow-hidden rounded-2xl border border-input bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Vista previa del vehículo"
            className="h-44 w-full object-cover"
          />
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
