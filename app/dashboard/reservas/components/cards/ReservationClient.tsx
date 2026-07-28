"use client";

import Image from "next/image";
import { FaEnvelope, FaPhoneAlt, FaUser } from "react-icons/fa";

interface ReservationClientProps {
  cliente: string;
  correo: string;
  telefono: string;
  fotoCliente?: string;
}

export default function ReservationClient({
  cliente,
  correo,
  telefono,
  fotoCliente,
}: ReservationClientProps) {
  const initials = cliente
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center gap-3">
        {fotoCliente ? (
          <Image
            src={fotoCliente}
            alt={cliente}
            width={52}
            height={52}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-sm font-bold text-white shadow-md">
            {initials}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-900">
            {cliente}
          </h3>

          <p className="text-xs text-slate-500">Cliente</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <FaEnvelope className="text-slate-500" />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-slate-400">Correo</p>
            <p className="truncate text-sm font-medium text-slate-700">
              {correo}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <FaPhoneAlt className="text-slate-500" />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-slate-400">Teléfono</p>
            <p className="truncate text-sm font-medium text-slate-700">
              {telefono}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
            <FaUser className="text-slate-500" />
          </div>

          <div>
            <p className="text-xs text-slate-400">Tipo</p>
            <p className="text-sm font-medium text-emerald-600">
              Cliente registrado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}