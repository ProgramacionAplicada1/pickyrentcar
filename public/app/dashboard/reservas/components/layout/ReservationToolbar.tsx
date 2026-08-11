"use client";

import {
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaCalendarAlt,
  FaCar,
  FaThLarge,
  FaList,
} from "react-icons/fa";

type Props = {
  query: string;
  setQuery: (value: string) => void;
};

export default function ReservationToolbar({ query, setQuery }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Search */}
        <div className="flex-1">
          <label className="sr-only" htmlFor="search-reservations">
            Buscar reserva
          </label>

          <div className="relative">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-reservations"
              type="text"
              placeholder="Buscar por cliente, vehículo, placa o reserva..."
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Filters (decorativos por ahora) */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            aria-disabled="true"
            title="Próximamente"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
          >
            <FaFilter className="text-slate-500" />
            Estado
          </button>

          <button
            type="button"
            aria-disabled="true"
            title="Próximamente"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
          >
            <FaCar className="text-slate-500" />
            Vehículo
          </button>

          <button
            type="button"
            aria-disabled="true"
            title="Próximamente"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
          >
            <FaCalendarAlt className="text-slate-500" />
            Fecha
          </button>

          <button
            type="button"
            aria-disabled="true"
            title="Próximamente"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
          >
            <FaSortAmountDown className="text-slate-500" />
            Ordenar
          </button>
        </div>

        {/* View toggles (decorativos) */}
        <div className="flex items-center gap-2 self-start xl:self-auto">
          <button
            type="button"
            aria-disabled="true"
            title="Próximamente"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
          >
            <FaThLarge />
          </button>

          <button
            type="button"
            aria-disabled="true"
            title="Próximamente"
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
          >
            <FaList />
          </button>
        </div>
      </div>
    </section>
  );
}