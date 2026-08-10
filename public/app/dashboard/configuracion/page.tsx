import { HugeiconsIcon } from "@hugeicons/react"
import { Settings01Icon } from "@hugeicons/core-free-icons"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata = {
  title: "Configuración · PickyRentCar",
}

export default function ConfiguracionPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-lg gap-6 rounded-3xl p-10 text-center shadow-sm">
        <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HugeiconsIcon
            icon={Settings01Icon}
            strokeWidth={1.75}
            className="size-7"
          />
        </div>
        <CardHeader className="gap-2 p-0">
          <CardTitle className="text-2xl">Próximamente</CardTitle>
          <CardDescription>
            La configuración del sistema estará disponible en próximas
            iteraciones.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
