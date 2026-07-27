import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarToggleProvider } from "@/components/sidebar-toggle-context"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

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