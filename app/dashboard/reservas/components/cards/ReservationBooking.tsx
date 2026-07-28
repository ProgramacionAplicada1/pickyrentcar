"use client";

import {
  FaCalendarAlt,
  FaArrowRight,
  FaMapMarkerAlt,
  FaHashtag,
  FaClock,
} from "react-icons/fa";

interface ReservationBookingProps {
  numeroReserva: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  ubicacion: string;
}

export default function ReservationBooking({
  numeroReserva,
  fechaInicio,
  fechaFin,
  dias,
  ubicacion,
}: ReservationBookingProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

      {/* Encabezado */}

      <div className="mb-5 flex items-center gap-2">
        <FaCalendarAlt className="text-blue-600" />

        <h3 className="text-sm font-bold text-slate-900">
          Información de la reserva
        </h3>
      </div>

      {/* Número */}

      <div className="mb-5 rounded-xl bg-white p-3 shadow-sm">

        <p className="text-xs uppercase tracking-wider text-slate-400">
          Número de reserva
        </p>

        <div className="mt-2 flex items-center gap-2">

          <FaHashtag className="text-slate-500" />

          <span className="font-semibold text-slate-800">
            {numeroReserva}
          </span>

        </div>

      </div>

      {/* Línea de tiempo */}

      <div className="rounded-xl bg-white p-4 shadow-sm">

        <div className="flex items-center justify-between">

          <div className="text-center">

            <p className="text-xs uppercase text-slate-400">
              Inicio
            </p>

            <h4 className="mt-1 font-bold text-slate-900">
              {fechaInicio}
            </h4>

          </div>

          <div className="flex flex-1 items-center px-4">

            <div className="h-0.5 flex-1 bg-slate-300" />

            <FaArrowRight className="mx-2 text-slate-400" />

            <div className="h-0.5 flex-1 bg-slate-300" />

          </div>

          <div className="text-center">

            <p className="text-xs uppercase text-slate-400">
              Fin
            </p>

            <h4 className="mt-1 font-bold text-slate-900">
              {fechaFin}
            </h4>

          </div>

        </div>

        <div className="mt-5 flex items-center gap-2">

          <FaClock className="text-amber-500" />

          <span className="text-sm font-medium text-slate-700">
            {dias} {dias === 1 ? "día" : "días"} de alquiler
          </span>

        </div>

      </div>

      {/* Ubicación */}

      <div className="mt-5 rounded-xl bg-white p-3 shadow-sm">

        <p className="text-xs uppercase tracking-wider text-slate-400">
          Sucursal
        </p>

        <div className="mt-2 flex items-center gap-2">

          <FaMapMarkerAlt className="text-red-500" />

          <span className="text-sm font-medium text-slate-700">
            {ubicacion}
          </span>

        </div>

      </div>

    </div>
  );
}