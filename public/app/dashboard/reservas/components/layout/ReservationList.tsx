"use client";

import { useMemo, useState } from "react";

import ReservationCard from "../cards/ReservationCard";
import ReservationDrawer from "../drawer/ReservationDrawer";
import ReservationTabs from "./ReservationTabs";
import ReservationToolbar from "./ReservationToolbar";

import type { Reservation } from "../../data/mockReservations";

type Props = {
  reservations: Reservation[];
  paidReservationIds?: Set<string>;
};

function matchesQuery(reservation: Reservation, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return (
    reservation.cliente.toLowerCase().includes(q) ||
    reservation.vehiculo.toLowerCase().includes(q) ||
    reservation.placa.toLowerCase().includes(q) ||
    reservation.numeroReserva.toLowerCase().includes(q)
  );
}

function isTodayRange(reservation: Reservation): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return (
    reservation.fechaInicio <= today && reservation.fechaFin >= today
  );
}

export default function ReservationList({
  reservations,
  paidReservationIds,
}: Props) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Todas");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (!matchesQuery(r, query)) return false;

      switch (activeTab) {
        case "Activas":
          return r.estado === "Activa";
        case "Pendientes":
          return r.estado === "Pendiente" || r.estado === "Pendiente de pago";
        case "Finalizadas":
          return r.estado === "Finalizada";
        case "Canceladas":
          return r.estado === "Cancelada";
        case "Hoy":
          return isTodayRange(r);
        case "Todas":
        default:
          return true;
      }
    });
  }, [reservations, query, activeTab]);

  const handleView = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <ReservationTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ReservationToolbar query={query} setQuery={setQuery} />

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Reservas registradas
            </h2>
            <p className="text-sm text-slate-500">
              Visualiza y administra las reservas de tu flota.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {filtered.length}{" "}
            {filtered.length === 1 ? "resultado" : "resultados"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No se encontraron reservas
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {reservations.length === 0
                ? "Cuando un cliente reserve uno de tus vehículos, aparecerá aquí."
                : "Prueba con otro término de búsqueda o cambia la pestaña."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onView={handleView}
                hasCompletedPayment={
                  paidReservationIds?.has(reservation.id) ?? false
                }
              />
            ))}
          </div>
        )}
      </section>

      <ReservationDrawer
        reservation={selectedReservation}
        reservations={reservations}
        open={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  );
}