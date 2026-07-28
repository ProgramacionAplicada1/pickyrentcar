"use client";
import {
  FaCalendarAlt,
  FaCarSide,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";

type ReservationStat = {
  label: string;
  value: string;
  icon: React.ElementType;
  accent: string;
  bg: string;
  text: string;
};

const stats: ReservationStat[] = [
  {
    label: "Reservas totales",
    value: "128",
    icon: FaCalendarAlt,
    accent: "border-blue-500/30",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
  },
  {
    label: "Activas",
    value: "15",
    icon: FaCarSide,
    accent: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
  },
  {
    label: "Hoy",
    value: "6",
    icon: FaClock,
    accent: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
  },
  {
    label: "Facturado",
    value: "RD$480,000",
    icon: FaMoneyBillWave,
    accent: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
  },
];

export default function ReservationStats() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.label}
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