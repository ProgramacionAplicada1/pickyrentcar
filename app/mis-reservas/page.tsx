import { createClient } from "@/lib/supabase/server"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Calendar01Icon, Car01Icon, CheckmarkBadge01Icon, Time01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import { getCurrentUser } from "@/services/auth"

export default async function MisReservasPage() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  const { data: reservas } = await supabase
    .from("reservations")
    .select("*")
    .eq("client_email", user?.email)
    .order("created_at", { ascending: false })

  const hasReservas = reservas && reservas.length > 0

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      
      <Link
        href="/catalogo"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
        Volver al catálogo
      </Link>

      <header className="mb-8 border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mis Reservas</h1>
        <p className="mt-2 text-sm text-slate-500">
          Revisa el historial y el estado de tus alquileres de vehículos.
        </p>
      </header>

      {!hasReservas ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.5} className="size-8" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">Aún no tienes reservas</h3>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Parece que no has alquilado ningún vehículo todavía. ¡Explora nuestra flota y haz tu primera reserva hoy!
          </p>
          <div className="mt-6">
            <Link 
              href="/catalogo" 
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Ver vehículos disponibles
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reservas.map((reserva) => {
            const isActiva = reserva.status === 'activa' || reserva.status === 'pendiente'

            return (
              <div key={reserva.id} className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <HugeiconsIcon icon={Car01Icon} strokeWidth={2} className="size-5 text-slate-700" />
                    <span className="truncate max-w-[150px]">Reserva de Vehículo</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      isActiva 
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20" 
                        : "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/20"
                    }`}
                  >
                    <HugeiconsIcon 
                      icon={isActiva ? CheckmarkBadge01Icon : Time01Icon} 
                      strokeWidth={2} 
                      className="size-3" 
                    />
                    {reserva.status}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">N° de Reserva</p>
                      <p className="mt-1 font-medium text-slate-900">{reserva.numero}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">Fecha de inicio</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {reserva.start_date ? new Date(reserva.start_date).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        }) : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link 
                      href={`/mis-reservas/${reserva.numero}`}
                      className="block w-full rounded-xl bg-slate-50 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}