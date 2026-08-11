"use client";

import Image from "next/image";
import { FaCarSide, FaGasPump, FaCogs } from "react-icons/fa";

interface ReservationVehicleProps {
  imagen: string;
  vehiculo: string;
  placa: string;
  tipoVehiculo: string;
  transmision: string;
  combustible: string;
}

export default function ReservationVehicle({
  imagen,
  vehiculo,
  placa,
  tipoVehiculo,
  transmision,
  combustible,
}: ReservationVehicleProps) {
  return (
    <div className="flex flex-col gap-5 md:flex-row">
      <div className="relative h-40 w-full flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-sm md:w-56">
        {imagen ? (
          <Image
            src={imagen}
            alt={vehiculo}
            fill
            sizes="(max-width: 768px) 100vw, 224px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FaCarSide className="text-5xl text-slate-400" />
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {tipoVehiculo}
        </span>

        <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur">
          {placa}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Vehículo reservado
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {vehiculo}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Placa {placa}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {tipoVehiculo}
          </span>

          <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <FaCogs />
            {transmision}
          </span>

          <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <FaGasPump />
            {combustible}
          </span>
        </div>
      </div>
    </div>
  );
}