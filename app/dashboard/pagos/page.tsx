import { HugeiconsIcon } from "@hugeicons/react";
import { MoneyBag01Icon } from "@hugeicons/core-free-icons";

import { PaymentRowActions, type PagoListItem } from "./payment-modal";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import {
  listPagos,
  type PagoEstado,
  type PagoMetodo,
} from "@/services/payments";

const ESTADO_BADGE: Record<PagoEstado, string> = {
  pendiente: "border border-amber-200 bg-amber-50 text-amber-700",
  completado: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  fallido: "border border-red-200 bg-red-50 text-red-700",
  reembolsado: "border border-slate-200 bg-slate-50 text-slate-700",
};

const ESTADO_LABEL: Record<PagoEstado, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  fallido: "Fallido",
  reembolsado: "Reembolsado",
};

function adaptToListItem(
  row: Awaited<ReturnType<typeof listPagos>>[number],
): PagoListItem {
  return {
    id: row.id,
    reservation_id: row.reservation_id,
    monto: row.monto,
    metodo_pago: row.metodo_pago as PagoMetodo,
    estado: row.estado as PagoEstado,
    numero: row.reservation?.numero ?? null,
    client_name: row.reservation?.client_name ?? null,
    vehicle_label: null,
  };
}

export default async function PagosPage() {
  const pagos = (await listPagos()).filter(
    (pago) => pago.estado === "pendiente",
  );
  const hasPagos = pagos.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Historial de Pagos
          </h1>
          <p className="text-sm text-muted-foreground">
            Revisa los pagos pendientes y confirma los pagos realizados por los
            clientes
          </p>
        </div>
      </div>

      {!hasPagos ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
          <div className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon
              icon={MoneyBag01Icon}
              strokeWidth={1.5}
              className="size-7"
            />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No hay pagos registrados
          </h3>

          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Los pagos realizados por los clientes aparecerán aquí para su
            verificación.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Reserva / Cliente</th>
                  <th className="px-6 py-4 font-medium">Monto</th>
                  <th className="px-6 py-4 font-medium">Método</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagos.map((pago) => {
                  const item = adaptToListItem(pago);
                  return (
                    <tr
                      key={pago.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs tracking-wider text-muted-foreground">
                            {item.numero ?? "—"}
                         
                         
                         </span>
                          <span>{item.client_name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(pago.monto)}
                      </td>
                      <td className="px-6 py-4">{pago.metodo_pago}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_BADGE[pago.estado as PagoEstado]}`}
                        >
                          {ESTADO_LABEL[pago.estado as PagoEstado]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(pago.created_at).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <PaymentRowActions pago={item} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
