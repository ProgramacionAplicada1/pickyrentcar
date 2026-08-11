"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

type ButtonVariant =
  | "default"
  | "outline"
  | "ghost"
  | "secondary"
  | "destructive"
  | "link"

type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"

type Props = {
  fallbackHref: string
  label: string
  icon?: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

export function BackButton({
  fallbackHref,
  label,
  icon,
  variant = "ghost",
  size = "sm",
  className,
}: Props) {
  const router = useRouter()
  const [mode, setMode] = React.useState<"fallback" | "back">("fallback")

  React.useEffect(() => {
    const ref = document.referrer
    if (!ref) return
    try {
      const url = new URL(ref)
      if (url.origin === window.location.origin) {
        // Read external DOM value (referrer) once on mount to switch to
        // history.back() mode. Runs at most once - no cascading renders.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMode("back")
      }
    } catch {
      /* silent */
    }
  }, [])

  function handleClick() {
    if (mode === "back") {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      {icon ?? <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.75} />}
      {label}
    </Button>
  )
}