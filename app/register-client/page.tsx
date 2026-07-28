import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"
import { ClientRegisterForm } from "@/components/client-register-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Crear cuenta · PickyRentCar",
  description:
    "Regístrate como cliente y reserva el vehículo que necesites de forma rápida y segura.",
}

export default async function ClientRegisterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/")
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-4 py-4 sm:py-6">
      <Link
        href="/landing-page"
        className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-card/80 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-card hover:text-foreground"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          strokeWidth={1.75}
          className="size-4"
        />
        Volver al inicio
      </Link>

      <div className="flex w-full max-w-md flex-col gap-3">
        <header className="flex flex-col items-center gap-2 text-center">
          <div className="inline-flex items-center gap-3.5">
            <Image
              src="/peaky-app.svg"
              alt="PickyRentCar"
              width={80}
              height={80}
              priority
              className="size-20"
            />
            <h1 className="text-3xl font-bold tracking-tight">PickyRentCar</h1>
          </div>
          <p className="max-w-sm text-[13px] leading-snug text-muted-foreground">
            Regístrate como cliente y reserva el vehículo que necesites de
            forma rápida y segura.
          </p>
        </header>
        <Card className="gap-3 rounded-2xl p-4 shadow-sm">
          <CardContent className="flex flex-col gap-1 p-0">
            <h2 className="text-base font-semibold text-foreground">
              Registro de Cliente
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Introduce tus datos para crear tu cuenta y empezar a rentar
              vehículos.
            </p>
          </CardContent>
          <CardContent className="p-0">
            <ClientRegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}