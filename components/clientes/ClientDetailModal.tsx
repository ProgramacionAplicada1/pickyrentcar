"use client";

import { useEffect } from "react";
import { FaEnvelope, FaPhoneAlt, FaTimes, FaCar } from "react-icons/fa";

import type { CLIENTE } from "@/services/clients";
import { formatCurrency } from "@/lib/utils/formatCurrency";

export type HistorialReservaCliente = {
  id: string;
  numero: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  vehicle: { brand: string; model: string } | null;
};

export type DetalleCliente = {
  client: CLIENTE;
  reservations: HistorialReservaCliente[];
  totalGastado: number;
};

interface ClientDetailModalProps {
  data: DetalleCliente | null;
  open: boolean;
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  pendiente_pago: "Pendiente de pago",
  activa: "Activa",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

const statusStyles: Record<string, string> = {
  pendiente: "border-amber-200 bg-amber-50 text-amber-700",
  pendiente_pago: "border-orange-200 bg-orange-50 text-orange-700",
  activa: "border-emerald-200 bg-emerald-50 text-emerald-700",
  finalizada: "border-blue-200 bg-blue-50 text-blue-700",
  cancelada: "border-red-200 bg-red-50 text-red-700",
};

export default function ClientDetailModal({
  data,
  open,
  onClose,
}: ClientDetailModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!data) return null;

  const { client, reservations, totalGastado } = data;

  const initials = client.nombre
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full max-w-lg rounded-3xl bg-white shadow-2xl transition-all duration-200 ${
          open ? "translate-y-0 scale-100" : "translate-y-2 scale-95"
        }`}
      >
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Detalle del cliente
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {client.nombre}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"
          >
            <FaTimes />
          </button>
        </header>

        <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">
          <section>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
                {initials}
              </div>

              <div>
                <h3 className="font-bold text-slate-900">{client.nombre}</h3>

                <p className="text-sm text-slate-500">
                  {client.tipo === "registrado"
                    ? "Cliente registrado"
                    : "Cliente invitado"}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <FaEnvelope className="text-slate-400" />
                <span>{client.email || "Sin correo"}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <FaPhoneAlt className="text-slate-400" />
                <span>{client.telefono || "Sin teléfono"}</span>
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-200" />

          <section>
            <h3 className="font-bold text-slate-900">Historial de reservas</h3>

            <div className="mt-4 space-y-3">
              {reservations.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Este cliente todavía no tiene reservas.
                </p>
              ) : (
                reservations.map((reservation) => {
                  const statusLabel =
                    statusLabels[reservation.status] ?? reservation.status;

                  const statusClass =
                    statusStyles[reservation.status] ??
                    "border-slate-200 bg-slate-50 text-slate-700";

                  return (
                    <div
                      key={reservation.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {reservation.numero}
                          </p>

                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                            <FaCar className="text-slate-400" />

                            <span>
                              {reservation.vehicle
                                ? `${reservation.vehicle.brand} ${reservation.vehicle.model}`
                                : "Vehículo no disponible"}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(Number(reservation.total_price))}
                        </span>

                        <span className="text-xs text-slate-500">
                          {reservation.start_date}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <div className="h-px bg-slate-200" />

          {/* Resumen */}
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Total de reservas
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {reservations.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Total gastado
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {formatCurrency(totalGastado)}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
