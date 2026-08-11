"use client"

import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

export function BackButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-fit rounded-full"
      onClick={() => router.back()}
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.75} />
      Volver
    </Button>
  )
}