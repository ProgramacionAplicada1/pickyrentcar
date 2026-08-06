import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarToggleProvider } from "@/components/sidebar-toggle-context"
import { getCurrentUser } from "@/services/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/catalogo")
  }

  const initials = user.displayName
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <SidebarToggleProvider>
      <div className="flex h-svh w-full overflow-hidden">
        <AppSidebar />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/30">
          <SiteHeader />

          <div className="min-h-0 flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarToggleProvider>
  )
}