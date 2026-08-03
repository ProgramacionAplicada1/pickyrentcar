import type { IconType } from "react-icons";

import {
  FaCalendarAlt,
  FaCar,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";

export interface ReservationStatsData {
  total: number;
  active: number;
  today: number;
  billed: number;

  activePercentage: number;
  todayPercentage: number;
  billedPercentage: number;
}

interface ReservationStatsProps {
  stats: ReservationStatsData;
}

interface StatCard {
  title: string;
  value: string;
  progress: number;
  icon: IconType;
  borderClass: string;
  iconClass: string;
  progressClass: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizePercentage(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

export default function ReservationStats({
  stats,
}: ReservationStatsProps) {
  const cards: StatCard[] = [
    {
      title: "Reservas totales",
      value: stats.total.toLocaleString("es-DO"),
      progress: stats.total > 0 ? 100 : 0,
      icon: FaCalendarAlt,
      borderClass: "border-blue-200",
      iconClass: "bg-blue-50 text-blue-600",
      progressClass: "bg-blue-500",
    },
    {
      title: "Activas",
      value: stats.active.toLocaleString("es-DO"),
      progress: stats.activePercentage,
      icon: FaCar,
      borderClass: "border-emerald-200",
      iconClass: "bg-emerald-50 text-emerald-600",
      progressClass: "bg-emerald-500",
    },
    {
      title: "Hoy",
      value: stats.today.toLocaleString("es-DO"),
      progress: stats.todayPercentage,
      icon: FaClock,
      borderClass: "border-amber-200",
      iconClass: "bg-amber-50 text-amber-600",
      progressClass: "bg-amber-500",
    },
    {
      title: "Facturado",
      value: formatCurrency(stats.billed),
      progress: stats.billedPercentage,
      icon: FaMoneyBillWave,
      borderClass: "border-cyan-200",
      iconClass: "bg-cyan-50 text-cyan-600",
      progressClass: "bg-cyan-500",
    },
  ];

  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const progress = normalizePercentage(card.progress);

          return (
            <article
              key={card.title}
              className={`
                rounded-3xl
                border
                ${card.borderClass}
                bg-white
                p-5
                shadow-sm
                transition
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                    {card.value}
                  </p>
                </div>

                <div
                  className={`
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    text-xl
                    ${card.iconClass}
                  `}
                >
                  <Icon />
                </div>
              </div>

              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${card.progressClass}`}
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}