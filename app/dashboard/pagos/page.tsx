import { createClient } from "@/lib/supabase/server"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoneyBag01Icon } from "@hugeicons/core-free-icons"
import { PaymentAction, PaymentRowActions } from "./payment-modal"

export default async function PagosPage() {
  const supabase = await createClient()

  const { data: pagos } = await supabase
    .from("pagos")
    .select("*")
    .order("created_at", { ascending: false })

  const hasPagos = pagos && pagos.length > 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Historial de Pagos</h1>
          <p className="text-sm text-muted-foreground">Administra y registra los pagos de las reservas.</p>
        </div>
        
       
        <PaymentAction />
      </div>

      {!hasPagos ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
          <div className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon icon={MoneyBag01Icon} strokeWidth={1.5} className="size-7" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No hay pagos registrados</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Haz clic en "Registrar Pago" para procesar una nueva transacción en el sistema.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Reserva / Vehículo</th>
                  <th className="px-6 py-4 font-medium">Monto</th>
                  <th className="px-6 py-4 font-medium">Método</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{pago.numero_reserva}</td>
                    <td className="px-6 py-4 font-medium">
                       {new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(pago.monto)}
                    </td>
                    <td className="px-6 py-4">{pago.metodo_pago}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        {pago.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(pago.created_at).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4 flex justify-end">
                     
                      <PaymentRowActions pago={pago} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}