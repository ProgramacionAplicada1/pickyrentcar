import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function DetalleReservaPage({
  params,
}: {
  params: Promise<{ numero: string }>
}) {
 
  const { numero } = await params

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <Link
        href="/mis-reservas"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
        Volver a mis reservas
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Detalles de la Reserva
        </h1>
        
        <div className="mt-6 rounded-xl bg-slate-50 p-6">
          <p className="text-sm text-slate-500">Número de confirmación</p>
          <p className="text-xl font-mono font-semibold text-slate-900 mt-1">
            {numero}
          </p>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Aquí próximamente diseñaremos la interfaz para mostrar el vehículo, las fechas exactas, el precio total y la opción para realizar el pago del anticipo.
        </p>
      </div>
    </div>
  )
}