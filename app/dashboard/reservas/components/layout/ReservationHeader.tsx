"use client";
import { FaCalendarCheck } from "react-icons/fa";

export default function ReservationHeader() {
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
    </section>
  );
}