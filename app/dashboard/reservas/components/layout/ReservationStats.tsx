"use client";

import {
  FaCalendarAlt,
  FaCarSide,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";

import type {
  AdaptedReservationStat,
  StatKey,
} from "../../lib/adapter";

const ICON_MAP: Record<StatKey, React.ElementType> = {
  total: FaCalendarAlt,
  activas: FaCarSide,
  hoy: FaClock,
  facturado: FaMoneyBillWave,
};

type Props = {
  stats: AdaptedReservationStat[];
};

export default function ReservationStats({ stats }: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = ICON_MAP[stat.key];

        return (
          <article
            key={stat.key}
            className={`rounded-3xl border ${stat.accent} bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </h3>
              </div>

              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg}`}>
                <Icon className={`text-lg ${stat.text}`} />
              </div>
            </div>

            <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
              <div className="h-1.5 w-2/3 rounded-full bg-gradient-to-r from-slate-900 to-slate-600" />
            </div>
          </article>
        );
      })}
    </section>
  );
}