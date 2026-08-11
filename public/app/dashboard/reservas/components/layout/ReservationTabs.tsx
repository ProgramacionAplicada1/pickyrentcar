"use client";

const tabs = [
  "Todas",
  "Activas",
  "Pendientes",
  "Finalizadas",
  "Canceladas",
  "Hoy",
];

type Props = {
  activeTab: string;
  setActiveTab: (value: string) => void;
};

export default function ReservationTabs({ activeTab, setActiveTab }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/15"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab}

              {isActive && (
                <span className="absolute bottom-0 left-1/2 h-1 w-8 -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}