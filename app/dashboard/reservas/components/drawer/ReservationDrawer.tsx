"use client";

import { useEffect } from "react";
import Image from "next/image";

import {
  FaCalendarAlt,
  FaCar,
  FaCreditCard,
  FaEnvelope,
  FaGasPump,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTimes,
  FaUser,
} from "react-icons/fa";

import type { Reservation } from "../../types/reservation"
import { formatCurrency } from "@/lib/utils/formatCurrency";

import StatusBadge from "../cards/StatusBadge";

interface ReservationDrawerProps {
  reservation: Reservation | null
  open: boolean
  onClose: () => void
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}


export default function ReservationDrawer({
  reservation,
  open,
  onClose,
}: ReservationDrawerProps) {
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

  if (!reservation) return null;

  const initials = reservation.cliente
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      aria-hidden={!open}
    >
      {/* Fondo oscuro */}
      <button
        type="button"
        aria-label="Cerrar panel"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"
          }`}
      />

      {/* Panel lateral */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${reservation.numeroReserva}`}
        className={`absolute right-0 top-0 flex h-svh w-full max-w-xl flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Encabezado */}
        <header className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Detalle de reserva
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {reservation.numeroReserva}
            </h2>

            <div className="mt-3">
              <StatusBadge status={reservation.estado} />
            </div>
          </div>

          <button
            type="button"
            title="Cerrar"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <FaTimes />
          </button>
        </header>

        {/* Contenido con scroll */}
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-slate-50 p-6">
          {/* Vehículo */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-56 bg-slate-100">
              {reservation.imagen ? (
                <Image
                  src={reservation.imagen}
                  alt={reservation.vehiculo}
                  fill
                  sizes="(max-width: 640px) 100vw, 576px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FaCar className="text-6xl text-slate-300" />
                </div>
              )}

              <span className="absolute left-4 top-4 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {reservation.tipoVehiculo}
              </span>

              <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow backdrop-blur">
                {reservation.placa}
              </span>
            </div>

            <div className="p-5">
              <h3 className="text-xl font-bold text-slate-900">
                {reservation.vehiculo}
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {reservation.tipoVehiculo}
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {reservation.transmision}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <FaGasPump />
                  {reservation.combustible}
                </span>
              </div>
            </div>
          </section>

          {/* Cliente */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
                {initials}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cliente
                </p>
                <h3 className="font-bold text-slate-900">
                  {reservation.cliente}
                </h3>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <FaEnvelope className="text-slate-400" />
                <span>{reservation.correo}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <FaPhoneAlt className="text-slate-400" />
                <span>{reservation.telefono}</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-600">
                <FaUser className="text-slate-400" />
                <span>Cliente registrado</span>
              </div>
            </div>
          </section>

          {/* Fechas */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" />
              <h3 className="font-bold text-slate-900">
                Período de alquiler
              </h3>
            </div>

            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  Inicio
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatDate(reservation.fechaInicio)}
                </p>
              </div>

              <div className="h-px w-10 bg-slate-300" />

              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  Fin
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatDate(reservation.fechaFin)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              {reservation.dias}{" "}
              {reservation.dias === 1 ? "día" : "días"} de alquiler
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <FaMapMarkerAlt className="text-red-500" />
              {reservation.ubicacion}
            </div>
          </section>

          {/* Pago */}
          {/* Pago */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total de la reserva
                </p>

                <h3 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  {formatCurrency(reservation.precio)}
                </h3>
              </div>

              <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Pago no registrado
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                  <FaCreditCard />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Precio diario
                  </p>

                  <p className="font-semibold text-slate-800">
                    {formatCurrency(reservation.precioDiario)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Método de pago
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {reservation.metodoPago ?? "No registrado"}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Acciones inferiores */}
        <footer className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-white p-5">
          <button
            type="button"
            onClick={() =>
              alert(`Editar ${reservation.numeroReserva}`)
            }
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Editar reserva
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Imprimir
          </button>
        </footer>
      </aside>
    </div>
  );
}