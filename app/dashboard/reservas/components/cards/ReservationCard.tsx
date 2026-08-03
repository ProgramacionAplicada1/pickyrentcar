"use client";

import type { Reservation } from "../../types/reservation";

import StatusBadge from "./StatusBadge";
import ReservationVehicle from "./ReservationVehicle";
import ReservationClient from "./ReservationClient";
import ReservationBooking from "./ReservationBooking";
import ReservationPayment from "./ReservationPayment";
import ReservationActions from "./ReservationActions";

interface ReservationCardProps {
  reservation: Reservation;
  onView?: (reservation: Reservation) => void;
  onEdit?: (reservation: Reservation) => void;
}

const borderColors: Record<string, string> = {
  activa: "border-l-emerald-500",
  activo: "border-l-emerald-500",
  active: "border-l-emerald-500",

  pendiente: "border-l-amber-500",
  pending: "border-l-amber-500",

  confirmada: "border-l-blue-500",
  confirmado: "border-l-blue-500",
  confirmed: "border-l-blue-500",

  finalizada: "border-l-blue-500",
  finalizado: "border-l-blue-500",
  completed: "border-l-blue-500",

  cancelada: "border-l-red-500",
  cancelado: "border-l-red-500",
  cancelled: "border-l-red-500",
  canceled: "border-l-red-500",
};

function getBorderColor(status: string) {
  const normalizedStatus = status.trim().toLowerCase();

  return (
    borderColors[normalizedStatus] ??
    "border-l-slate-400"
  );
}

export default function ReservationCard({
  reservation,
  onView,
  onEdit,
}: ReservationCardProps) {
  const borderColor = getBorderColor(reservation.estado);

  return (
    <article
      className={`
        group
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        border-l-[6px]
        ${borderColor}
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      `}
    >
      {/* ================= HEADER ================= */}

      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Reserva
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {reservation.numeroReserva}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <StatusBadge status={reservation.estado} />
          </div>
        </div>
      </div>

      {/* ================= VEHÍCULO ================= */}

      <div className="px-6 pt-6">
        <ReservationVehicle
          imagen={reservation.imagen}
          vehiculo={reservation.vehiculo}
          placa={reservation.placa}
          tipoVehiculo={reservation.tipoVehiculo}
          transmision={reservation.transmision}
          combustible={reservation.combustible}
        />
      </div>

      {/* ================= INFORMACIÓN ================= */}

      <div className="grid gap-5 p-6 xl:grid-cols-3">
        <ReservationClient
          cliente={reservation.cliente}
          correo={reservation.correo}
          telefono={reservation.telefono}
        />

        <ReservationBooking
          numeroReserva={reservation.numeroReserva}
          fechaInicio={reservation.fechaInicio}
          fechaFin={reservation.fechaFin}
          dias={reservation.dias}
          ubicacion={reservation.ubicacion}
        />

        <ReservationPayment
          precio={reservation.precio}
          precioDiario={reservation.precioDiario}
          metodoPago={reservation.metodoPago}
          estadoPago={reservation.estadoPago}
        />
      </div>

      {/* ================= FOOTER ================= */}

      <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Vehículo reservado
          </p>

          <h3 className="font-semibold text-slate-800">
            {reservation.vehiculo}
          </h3>

          {reservation.nombreVehiculo && (
            <p className="mt-0.5 text-xs text-slate-500">
              {reservation.nombreVehiculo}
            </p>
          )}
        </div>

        <ReservationActions
          onView={() => onView?.(reservation)}
          onEdit={() => onEdit?.(reservation)}
          onPrint={() => window.print()}
          onMore={() =>
            alert(
              `Más opciones para ${reservation.numeroReserva}`
            )
          }
        />
      </div>
    </article>
  );
}