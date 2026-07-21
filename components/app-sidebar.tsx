"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Car01Icon,
  DashboardSquare01Icon,
} from "@hugeicons/core-free-icons"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

type NavItem = {
  title: string
  url: string
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  matchPrefix?: boolean
}

const items: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: DashboardSquare01Icon },
  {
    title: "Vehículos",
    url: "/dashboard/vehicles",
    icon: Car01Icon,
    matchPrefix: true,
  },
]

function isItemActive(pathname: string, item: NavItem) {
  if (item.matchPrefix) {
    return pathname === item.url || pathname.startsWith(`${item.url}/`)
  }
  return pathname === item.url
}

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-2 py-1.5"
        >
          <Image
            src="/logo-prototipo-3.svg"
            alt="PickyRentCar"
            width={32}
            height={32}
            className="size-8"
          />
          <span className="text-base font-semibold tracking-tight">
            PickyRentCar
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={isItemActive(pathname, item)}
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={1.75} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="default"
          size="lg"
          className="w-full rounded-full"
          nativeButton={false}
          render={<Link href="/dashboard/vehicles/new" />}
        >
          <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
          Crear vehículo
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
