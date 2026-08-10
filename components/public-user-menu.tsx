"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  FiCalendar,
  FiChevronDown,
  FiHeart,
  FiLogOut,
  FiSearch,
  FiUser,
} from "react-icons/fi"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "U"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

type Props = {
  displayName: string
  email: string
}

export function PublicUserMenu({ displayName, email }: Props) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  async function handleLogout() {
    if (isPending) return
    setIsPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-full border bg-background px-1.5 pr-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Abrir menú de usuario"
          />
        }
      >
        <Avatar className="size-7">
          <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
            {initials(displayName)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-28 truncate sm:inline">
          {displayName.split(" ")[0] || "Mi cuenta"}
        </span>
        <FiChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="space-y-0.5 px-3 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </p>
          </DropdownMenuLabel>

          <DropdownMenuItem onClick={() => router.push("/perfil")}>
            <FiUser />
            Mi perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/mis-reservas")}>
            <FiCalendar />
            Mis reservas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/favoritos")}>
            <FiHeart />
            Favoritos
          </DropdownMenuItem>
          <DropdownMenuItem
            className="sm:hidden"
            onClick={() => router.push("/catalogo")}
          >
            <FiSearch />
            Explorar vehículos
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={handleLogout}
        >
          <FiLogOut />
          {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
