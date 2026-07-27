"use client";
import { FaCalendarCheck, FaPlus } from "react-icons/fa";

type ReservationHeaderProps = {
  onNewReservation?: () => void;
};

export default function ReservationHeader({
  onNewReservation,
}: ReservationHeaderProps) {
  return (
    <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
          <FaCalendarCheck className="text-blue-600" />
          Centro de reservas
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Reservas
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Gestiona todas las reservas de vehículos, revisa su estado y accede
            rápidamente a los detalles de cada cliente.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNewReservation}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
        disabled={!onNewReservation}
      >
        <FaPlus className="text-sm" />
        Nueva reserva
      </button>
    </section>
  );
}