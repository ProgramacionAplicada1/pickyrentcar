"use client"

import { useState } from "react"

import ReservationCard from "../cards/ReservationCard"
import ReservationDrawer from "../drawer/ReservationDrawer"

import type { Reservation } from "../../types/reservation"

interface ReservationListProps {
  reservations: Reservation[]
}

export default function ReservationList({
  reservations,
}: ReservationListProps) {
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleView = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)

    window.setTimeout(() => {
      setSelectedReservation(null)
    }, 300)
  }

  if (reservations.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
          🚗
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          No hay reservas registradas
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Las reservas creadas en Supabase aparecerán aquí.
        </p>
      </section>
    )
  }

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Reservas registradas
            </h2>

            <p className="text-sm text-slate-500">
              Datos obtenidos directamente desde Supabase.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {reservations.length}{" "}
            {reservations.length === 1
              ? "reserva"
              : "reservas"}
          </span>
        </div>

        <div className="space-y-6">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onView={handleView}
              onEdit={(selectedReservation) => {
                console.log(
                  "Editar reserva:",
                  selectedReservation
                )
              }}
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
  )
}