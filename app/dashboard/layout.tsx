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
      <div className="flex min-h-svh w-full">
        <AppSidebar />
        <main className="flex flex-1 flex-col overflow-y-auto bg-muted/30">
          <SiteHeader />
          {children}
        </main>
      </div>
    </SidebarToggleProvider>
  )
}
