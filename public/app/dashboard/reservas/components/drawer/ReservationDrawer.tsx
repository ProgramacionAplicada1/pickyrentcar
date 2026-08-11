"use client";

import { useEffect } from "react";
import { FaEnvelope, FaPhoneAlt, FaTimes,FaCar, FaCalendarAlt } from "react-icons/fa";
import type { Reservation } from "../../data/mockReservations";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import StatusBadge from "../cards/StatusBadge";

interface ReservationDrawerProps {
  reservation: Reservation | null;
  reservations: Reservation[];
  open: boolean;
  onClose: () => void;
}

export default function ReservationDrawer({
  reservation,reservations,open,onClose}: ReservationDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    }



    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    }

  }, [open, onClose]);

  if (!reservation) return null




  const clientReservaciones = reservations.filter(
    (item) =>
      item.cliente.trim().toLowerCase() ===
      reservation.cliente.trim().toLowerCase(),
  );


  const totalGastado = clientReservaciones.reduce(
    (total, item) => total + Number(item.precio),
    0,
  );



  const iniciales = reservation.cliente
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition ${
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >


      <button
        type="button"
        aria-label="Cerrar ventana"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      />

      

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle del cliente ${reservation.cliente}`}
        className={`relative z-10 w-full max-w-lg transform rounded-3xl bg-white shadow-2xl transition-all duration-300 ${
          open ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
      >


        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Detalle del cliente
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {reservation.cliente}
            </h2>
          </div>

          <button
            type="button"
            title="Cerrar"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <FaTimes />
          </button>
        </div>



        <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6">

          <section>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
                {iniciales}
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  {reservation.cliente}
                </h3>

                <p className="text-sm text-slate-500">Cliente invitado</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                  <FaEnvelope className="text-slate-500" />
                </div>

                <span>{reservation.correo || "Sin correo"}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                  <FaPhoneAlt className="text-slate-500" />
                </div>

                <span>{reservation.telefono || "Sin teléfono"}</span>
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-200" />

          <section>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" />

              <h3 className="font-bold text-slate-900">
                Historial de reservas
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {clientReservaciones.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {item.numeroReserva}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                        <FaCar className="text-slate-400" />
                        {item.vehiculo}
                      </div>
                    </div>

                    <StatusBadge status={item.estado} />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(item.precio)}
                    </span>

                    <span className="text-xs text-slate-500">
                      {item.fechaInicio}
                    </span>
                  </div>

                  <div className="mt-2">
                    <span className="text-xs font-medium text-slate-500">
                      Pago:{" "}
                    </span>

                    <span className="text-xs font-semibold text-slate-700">
                      {item.estadoPago}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-slate-200" />

          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Total de reservas
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {clientReservaciones.length}
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