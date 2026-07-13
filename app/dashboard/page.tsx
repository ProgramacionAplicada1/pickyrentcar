import { redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Car01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/register")
  }

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ?? user.email ?? ""

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-muted/30 px-4 py-16">
      <Card className="w-full max-w-lg gap-5 rounded-3xl p-8 text-center shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 p-0">
          <div className="inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            ¡Bienvenido, {fullName}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Tu cuenta de administrador se creó correctamente. Aquí irá el panel
            de gestión de flota de PickyRentCar.
          </p>
          <div className="flex w-full items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-3 text-left text-xs text-muted-foreground">
            <HugeiconsIcon icon={Car01Icon} strokeWidth={1.75} className="size-4 shrink-0" />
            <span className="truncate">Sesión iniciada como {user.email}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}