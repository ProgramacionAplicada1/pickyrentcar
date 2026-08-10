"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FiHeart } from "react-icons/fi"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

type Props = {
  vehicleId: string
  userId?: string | null
  initialFavorite?: boolean
  className?: string
  label?: boolean
}

export function FavoriteButton({
  vehicleId,
  userId,
  initialFavorite = false,
  className,
  label = false,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [favorite, setFavorite] = React.useState(initialFavorite)
  const [pending, setPending] = React.useState(false)

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (!userId) {
      const query = searchParams.toString()
      const next = `${pathname}${query ? `?${query}` : ""}`
      router.push(`/login?next=${encodeURIComponent(next)}`)
      return
    }

    if (pending) return

    const nextFavorite = !favorite
    setFavorite(nextFavorite)
    setPending(true)

    const supabase = createClient()
    const result = nextFavorite
      ? await supabase.from("favorites").insert({
          user_id: userId,
          vehicle_id: vehicleId,
        })
      : await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("vehicle_id", vehicleId)

    if (result.error) {
      setFavorite(!nextFavorite)
      toast.error("No pudimos actualizar tus favoritos", {
        description:
          "Verifica que la migración 013 esté aplicada e inténtalo nuevamente.",
      })
      setPending(false)
      return
    }

    toast.success(
      nextFavorite ? "Agregado a favoritos" : "Eliminado de favoritos",
      {
        description: nextFavorite
          ? "Puedes encontrar este vehículo en tu perfil."
          : "El vehículo ya no aparece en tu lista de favoritos.",
      },
    )

    setPending(false)
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      aria-pressed={favorite}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-full border border-black/5 bg-white/95 px-2.5 text-sm font-medium text-foreground shadow-sm backdrop-blur transition hover:scale-[1.03] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-70",
        !label && "w-9 px-0",
        className,
      )}
    >
      <FiHeart
        className={cn(
          "size-4 transition",
          favorite && "fill-red-500 text-red-500",
        )}
      />
      {label && (favorite ? "Guardado" : "Favorito")}
    </button>
  )
}
