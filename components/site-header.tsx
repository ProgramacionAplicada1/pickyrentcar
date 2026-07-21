"use client"

import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { SidebarLeftIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { QuickCreateButton } from "@/components/quick-create-button"
import { useSidebarToggle } from "@/components/sidebar-toggle-context"

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/vehicles": "Vehículos",
  "/dashboard/vehicles/new": "Crear vehículo",
  "/dashboard/clientes": "Clientes",
  "/dashboard/reservas": "Reservas",
  "/dashboard/pagos": "Pagos",
  "/dashboard/reportes": "Reportes",
  "/dashboard/configuracion": "Configuración",
}

export function SiteHeader() {
  const { toggle } = useSidebarToggle()
  const pathname = usePathname()
  const title = TITLES[pathname] ?? "Dashboard"

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Alternar sidebar"
          onClick={toggle}
          className="hidden md:inline-flex"
        >
          <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={2} />
        </Button>
        <Separator orientation="vertical" className="h-4 hidden md:block" />
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <QuickCreateButton />
      </div>
    </header>
  )
}
