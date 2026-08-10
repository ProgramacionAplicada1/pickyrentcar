import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Calendar01Icon, Car01Icon, Wallet01Icon, CheckmarkBadge01Icon } from "@hugeicons/core-free-icons"
import { notFound } from "next/navigation"

export default async function DetalleReservaPage({
  params,
}: {
  params: Promise<{ numero: string }>
}) {
  const { numero } = await params
  const supabase = await createClient()

  
  const { data: reserva, error } = await supabase
    .from("reservations")
    .select(`
      *,
      vehicles (*)
    `)
    .eq("numero", numero)
    .single()

  
  if (error || !reserva) {
    notFound()
  }

  const vehiculo = reserva.vehicles
  const isActiva = reserva.status === 'activa' || reserva.status === 'pendiente' || reserva.status?.toLowerCase().includes('pago')

  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No definida"
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: 'short', day: "2-digit", month: "long", year: "numeric"
    })
  }

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <Link
        href="/mis-reservas"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
        Volver a mis reservas
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Reserva {reserva.numero}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Titular: <span className="font-medium text-slate-700">{reserva.client_name || reserva.client_email}</span>
            </p>
          </div>
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold capitalize ${
              isActiva
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                : "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/20"
            }`}
          >
            <HugeiconsIcon icon={CheckmarkBadge01Icon} strokeWidth={2} className="size-4" />
            {reserva.status?.replace('_', ' ') || "Pendiente"}
          </span>
        </div>

        
        <div className="p-6 md:p-8 grid gap-8 md:grid-cols-2">
          
       
          <div className="space-y-8">
           
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <HugeiconsIcon icon={Car01Icon} className="size-5 text-slate-700" />
                Vehículo Reservado
              </h3>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                {vehiculo ? (
                  <div>
                    <p className="text-lg font-medium text-slate-900">
                      {vehiculo.marca || 'Marca'} {vehiculo.modelo || 'Modelo'} 
                      <span className="ml-2 text-slate-500 text-sm font-normal">({vehiculo.año || vehiculo.year || 'N/A'})</span>
                    </p>
                    <p className="mt-1 text-sm text-slate-500 uppercase tracking-wide">
                      Placa: <span className="font-medium">{vehiculo.placa || "Pendiente"}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Los detalles técnicos del vehículo no están disponibles.</p>
                )}
              </div>
            </section>

            
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <HugeiconsIcon icon={Calendar01Icon} className="size-5 text-slate-700" />
                Período de Alquiler
              </h3>
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Recogida</p>
                  <p className="text-sm font-medium text-slate-900 capitalize">{formatDate(reserva.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Devolución</p>
                  <p className="text-sm font-medium text-slate-900 capitalize">{formatDate(reserva.end_date)}</p>
                </div>
              </div>
            </section>
          </div>

          
          <div className="space-y-8">
            <section>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
               <HugeiconsIcon icon={Wallet01Icon} className="size-5 text-slate-700" />
                Resumen Financiero
              </h3>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tarifa diaria</span>
                  <span className="font-medium text-slate-900">
                    ${vehiculo?.precio_dia || vehiculo?.price_per_day || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Días cotizados</span>
                  <span className="font-medium text-slate-900">{reserva.dias || "N/A"} días</span>
                </div>
                
                <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                  <span className="text-sm font-semibold uppercase tracking-wider text-slate-900">Total a Pagar</span>
                  <span className="text-2xl font-bold text-slate-900">
                    ${reserva.total_price || reserva.total || "0.00"}
                  </span>
                </div>
              </div>
            </section>

            
            <div className="pt-2">
              <button className="w-full rounded-xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white shadow-sm transition-transform hover:bg-slate-800 hover:scale-[1.01] active:scale-95">
                Pagar anticipo de reserva
              </button>
              <p className="mt-3 text-center text-xs text-slate-500 leading-relaxed">
                Este vehículo permanecerá bloqueado a tu nombre. Completa el pago del anticipo para asegurar tu alquiler.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}