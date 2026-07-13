import type { Metadata } from "next"
import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"
import { RegisterForm } from "@/components/register-form"

export const metadata: Metadata = {
  title: "Crear cuenta · PickyRentCar",
  description:
    "Únete como administrador y gestiona tu flota de vehículos de manera eficiente.",
}

export default function RegisterPage() {
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
            <h1 className="text-4xl font-bold tracking-tight">PickyRentCar</h1>
          </div>
          <p className="max-w-sm text-[13px] leading-snug text-muted-foreground">
            Únete como administrador y gestiona tu flota de vehículos de manera
            eficiente.
          </p>
        </header>

        <Card className="gap-4 rounded-2xl p-5 shadow-sm">
          <CardContent className="flex flex-col gap-1 p-0">
            <h2 className="text-base font-semibold text-foreground">
              Registro de Administrador
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Introduce tus credenciales corporativas para acceder al panel de
              gestión.
            </p>
          </CardContent>
          <CardContent className="p-0">
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}