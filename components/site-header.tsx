"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { QuickCreateButton } from "@/components/quick-create-button"
import { LogoutButton } from "@/components/logout-button"

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/vehicles": "Vehículos",
  "/dashboard/vehicles/new": "Crear vehículo",
}

export function SiteHeader() {
  const pathname = usePathname()
  const title = TITLES[pathname] ?? "Dashboard"

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <QuickCreateButton />
        <LogoutButton />
      </div>
    </header>
  )
}
