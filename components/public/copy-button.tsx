"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function CopyButton({ value, label }: { value: string; label: string }) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copiado.`)
    } catch {
      toast.error("No se pudo copiar.")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="shrink-0 rounded-full"
      onClick={handleCopy}
      aria-label={`Copiar ${label.toLowerCase()}`}
    >
      <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
    </Button>
  )
}
