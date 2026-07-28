"use client";

import { useState } from "react";

import ReservationCard from "../cards/ReservationCard";
import ReservationDrawer from "../drawer/ReservationDrawer";

import {
  mockReservations,
  type Reservation,
} from "../../data/mockReservations";

export default function ReservationList() {
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleView = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Reservas recientes
            </h2>

            <p className="text-sm text-slate-500">
              Visualiza y administra las reservas registradas en el sistema.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {mockReservations.length} resultados
          </span>
        </div>

        <div className="space-y-6">
          {mockReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onView={handleView}
              onEdit={(selected) =>
                alert(`Editar ${selected.numeroReserva}`)
              }
            />
          ))}
        </div>
      </section>

      <ReservationDrawer
        reservation={selectedReservation}
        open={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  );
}