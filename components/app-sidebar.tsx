"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  BarChartIcon,
  Calendar01Icon,
  Car01Icon,
  DashboardSquare01Icon,
  MoneyBag01Icon,
  Settings01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { LogoutDialogButton } from "@/components/logout-dialog-button"
import { useSidebarToggle } from "@/components/sidebar-toggle-context"
import { createClient } from "@/lib/supabase/client"

type NavItem = {
  name: string
  href: string
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  matchPrefix?: boolean
}

const items: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardSquare01Icon },
  {
    name: "Vehículos",
    href: "/dashboard/vehicles",
    icon: Car01Icon,
    matchPrefix: true,
  },
  {
    name: "Clientes",
    href: "/dashboard/clientes",
    icon: UserGroupIcon,
    matchPrefix: true,
  },
  {
    name: "Reservas",
    href: "/dashboard/reservas",
    icon: Calendar01Icon,
    matchPrefix: true,
  },
  {
    name: "Pagos",
    href: "/dashboard/pagos",
    icon: MoneyBag01Icon,
    matchPrefix: true,
  },
  {
    name: "Reportes",
    href: "/dashboard/reportes",
    icon: BarChartIcon,
    matchPrefix: true,
  },
  {
    name: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings01Icon,
    matchPrefix: true,
  },
]

type SidebarUser = {
  name: string
  email: string
}

export function AppSidebar() {
  const { isOpen } = useSidebarToggle()
  const pathname = usePathname()
  const [user, setUser] = React.useState<SidebarUser | null>(null)

  React.useEffect(() => {
    const supabase = createClient()
    let active = true
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!active || !data.user) return
        const meta =
          (data.user.user_metadata as Record<string, string | undefined>) ?? {}
        const name =
          meta.full_name ??
          meta.name ??
          meta.nombre ??
          data.user.email?.split("@")[0] ??
          "Usuario"
        setUser({ name, email: data.user.email ?? "" })
      })
      .catch(() => {
        /* ignore silently in sidebar */
      })
    return () => {
      active = false
    }
  }, [])

  const displayName = user?.name ?? "Cargando..."
  const initials = user
    ? displayName
        .split(" ")
        .map((p) => p[0] ?? "")
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "..."

  return (
    <aside
      className={cn(
        "shrink-0 overflow-hidden border-r border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white transition-[width] duration-200 ease-linear",
        isOpen ? "w-[18rem]" : "w-0",
      )}
    >
      <div className="flex h-screen w-[18rem] flex-col">
        {/* Logo */}
        <div className="border-b border-slate-800 px-8 py-7">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
              <Image
                src="/logo-prototipo-3.svg"
                alt="PickyRentCar"
                width={52}
                height={52}
                priority
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-wide">PickyRentCar</h1>
              <p className="text-xs text-slate-400">Sistema Administrativo</p>
            </div>
          </Link>
        </div>

        {/* Menu */}
        <nav className="scrollbar-hide flex-1 space-y-2 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-4 text-xs tracking-widest text-slate-500 uppercase">
            Navegación
          </p>
          {items.map((item) => {
            const Icon = item.icon
            const isActive = item.matchPrefix
              ? pathname === item.href ||
                pathname.startsWith(`${item.href}/`)
              : pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <HugeiconsIcon
                    icon={Icon}
                    strokeWidth={1.75}
                    className={`text-lg transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-blue-400"
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className={cn(
                    "text-xs transition-opacity",
                    isActive
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100",
                  )}
                />
              </Link>
            )
          })}
        </nav>

        <div className="px-6 pb-5">
          <hr className="border-slate-800" />
        </div>

        {/* Footer usuario */}
        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center justify-between rounded-xl border border-transparent bg-slate-900/50 p-2 transition-all duration-300 hover:border-slate-700 hover:bg-slate-800">
            <div className="flex min-w-0 items-center gap-3 overflow-hidden">
              <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 font-bold text-sm text-white shadow-md">
                {initials}
                {user && (
                  <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-slate-900 bg-green-500" />
                )}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <h3 className="truncate text-sm font-semibold text-white">
                  {displayName}
                </h3>
                <p className="mt-0.5 truncate text-[11px] text-slate-400">
                  {user?.email ?? ""}
                </p>
                <p className="mt-1 truncate text-[11px] font-bold tracking-wider text-blue-400 uppercase">
                  Administrador
                </p>
              </div>
            </div>
            <LogoutDialogButton />
          </div>
        </div>
      </div>
    </aside>
  )
}
