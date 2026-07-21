import type { Metadata } from "next"
import Image from "next/image"
import { redirect } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { LoginForm } from "@/components/login-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Iniciar sesión · PickyRentCar",
  description: "Accede al panel de administración de PickyRentCar.",
}

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-6 sm:py-8">
      <div className="flex w-full max-w-md flex-col gap-4">
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center gap-3.5">
            <Image
              src="/logo-prototipo-3.svg"
              alt="PickyRentCar"
              width={96}
              height={96}
              priority
              className="size-24"
            />
            <h1 className="text-4xl font-bold tracking-tight">
              PickyRentCar
            </h1>
          </div>

          <p className="max-w-sm text-[13px] leading-snug text-muted-foreground">
            Inicia sesión para acceder al panel de administración.
          </p>
        </header>

        <Card className="gap-4 rounded-2xl p-5 shadow-sm">
          <CardContent className="flex flex-col gap-1 p-0">
            <h2 className="text-base font-semibold">
              Iniciar sesión
            </h2>

            <p className="text-sm text-muted-foreground">
              Introduce tus credenciales para continuar.
            </p>
          </CardContent>

          <CardContent className="p-0">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
