import { Card, CardContent } from "@/components/ui/card";

import type { ClientListItem } from "@/services/clients";

import {
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaUserFriends,
} from "react-icons/fa";

type Props = {
  clients: ClientListItem[];
};

export function ClientsStats({ clients }: Props) {
  const total = clients.length;

  const registrados = clients.filter(
    (client) => client.tipo === "registrado",
  ).length;

  const invitados = clients.filter(
    (client) => client.tipo === "invitado",
  ).length;

  const activos = clients.filter((client) => client.estado === "activo").length;

  const cards = [
    {
      title: "Clientes",
      value: total,
      accent: "border-blue-500/30",
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      icon: FaUsers,
    },
    {
      title: "Registrados",
      value: registrados,
      accent: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      icon: FaUserCheck,
    },
    {
      title: "Invitados",
      value: invitados,
      accent: "border-amber-500/30",
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      icon: FaUserFriends,
    },
    {
      title: "Activos",
      value: activos,
      accent: "border-cyan-500/30",
      bg: "bg-cyan-500/10",
      text: "text-cyan-500",
      icon: FaUserClock,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className={`rounded-3xl border ${card.accent} bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
          >
            <CardContent className="p-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg}`}
                >
                  <Icon className={`text-lg ${card.text}`} />
                </div>
              </div>

              <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100">
                <div className="h-1.5 w-2/3 rounded-full bg-gradient-to-r from-slate-900 to-slate-600" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
