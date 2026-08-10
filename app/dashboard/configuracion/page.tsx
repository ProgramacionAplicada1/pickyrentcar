import { HugeiconsIcon } from "@hugeicons/react"

import { Settings01Icon } from "@hugeicons/core-free-icons"

export const metadata = {
  title: "Configuración · PickyRentCar",
}

export default function ConfiguracionPage() {
  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10">
      <header className="mb-8 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuración</h1>
            <p className="mt-1 text-sm text-slate-500">
              Administra los ajustes de tu cuenta y preferencias del sistema.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-12">
        
        <section className="md:col-span-12 lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <HugeiconsIcon icon={Settings01Icon} className="size-6 text-slate-500" />
              Información Personal
            </h2>
            
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nombre completo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Alexis Quezada"
                    className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Teléfono</label>
                  <input 
                    type="tel" 
                    placeholder="(809) 000-0000"
                    className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Número de Licencia de Conducir</label>
                <input 
                  type="text" 
                  placeholder="Requerido para aprobar reservas"
                  className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none transition-all focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2">
                <button type="button" className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </section>

        
        <div className="md:col-span-12 lg:col-span-5 space-y-8">
          
          
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <HugeiconsIcon icon={Settings01Icon} className="size-6 text-slate-500" />
              Notificaciones
            </h2>
            <div className="space-y-5">
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-900">Actualizaciones de Reserva</p>
                  <p className="text-xs text-slate-500 mt-0.5">Recibir correos cuando el estado de tu vehículo cambie.</p>
                </div>
                <input type="checkbox" className="mt-1 size-4 accent-slate-900" defaultChecked />
              </label>
              
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-slate-900">Recordatorios de Devolución</p>
                  <p className="text-xs text-slate-500 mt-0.5">Avisos 24 horas antes de que finalice tu alquiler.</p>
                </div>
                <input type="checkbox" className="mt-1 size-4 accent-slate-900" defaultChecked />
              </label>
            </div>
          </section>

          
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <HugeiconsIcon icon={Settings01Icon} className="size-6 text-slate-500" />
              Seguridad
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              Mantén tu cuenta segura actualizando tu contraseña periódicamente.
            </p>
            <button className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
              Cambiar contraseña
            </button>
          </section>

        </div>
      </div>
    </div>
  )
}

/*
f
*/