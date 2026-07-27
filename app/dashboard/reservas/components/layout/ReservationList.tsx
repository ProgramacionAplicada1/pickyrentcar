import ReservationCard from "../cards/ReservationCard";
import { mockReservations } from "../../data/mockReservations";

export default function ReservationList() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Encabezado */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Reservas recientes
          </h2>

          <p className="text-sm text-slate-500">
            Visualiza y administra las reservas registradas en el sistema.
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {mockReservations.length} resultados
        </span>
      </div>

      {/* Lista */}
      <div className="space-y-6">
        {mockReservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
          />
        ))}
      </div>
    </section>
  );
}