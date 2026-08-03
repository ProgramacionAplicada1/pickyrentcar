import type {
  Reservation,
  AdaptedReservationStatus,
  PaymentStatus,
  PaymentMethod,
} from "@/app/dashboard/reservas/data/mockReservations"
import { formatCurrency } from "@/lib/utils/formatCurrency"
import type { ReservationRow, ReservationStats } from "@/services/reservations"

// ============================================================================
// Status mapping (DB lowercase → mock Spanish capitalized)
// ============================================================================

type AdaptedStatus = Extract<
  AdaptedReservationStatus,
  "Pendiente" | "Activa" | "Finalizada" | "Cancelada"
>

function adaptStatus(dbStatus: string): AdaptedStatus {
  switch (dbStatus) {
    case "pendiente":
      return "Pendiente"
    case "confirmada":
    case "activa":
      return "Activa"
    case "finalizada":
      return "Finalizada"
    case "cancelada":
      return "Cancelada"
    default:
      return "Pendiente"
  }
}

// ============================================================================
// Reservation adapter
// ============================================================================

function adaptPaymentStatus(dbStatus: string): PaymentStatus {
  if (dbStatus === "pendiente" || dbStatus === "confirmada") return "Pendiente"
  if (dbStatus === "cancelada") return "Pendiente"
  return "Pagado"
}

const DEFAULT_PAYMENT_METHOD: PaymentMethod = "Efectivo"

export function adaptReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    numeroReserva: row.numero,
    cliente: row.client_name,
    correo: row.client_email ?? "",
    telefono: row.client_phone,
    fotoCliente: undefined,
    vehiculo: `${row.vehicle.brand} ${row.vehicle.model}`,
    tipoVehiculo: row.vehicle.category,
    placa: row.vehicle.plate,
    transmision:
      row.vehicle.transmission === "Manual" ? "Manual" : "Automático",
    combustible: ((): Reservation["combustible"] => {
      const ft = row.vehicle.fuel_type
      if (
        ft === "Gasolina" ||
        ft === "Diésel" ||
        ft === "Híbrido" ||
        ft === "Eléctrico"
      ) {
        return ft
      }
      return "Gasolina"
    })(),
    imagen: row.vehicle.image_urls[0] ?? "",
    fechaInicio: row.start_date,
    fechaFin: row.end_date,
    dias: row.days,
    precio: Number(row.total_price),
    estado: adaptStatus(row.status),
    metodoPago: DEFAULT_PAYMENT_METHOD,
    estadoPago: adaptPaymentStatus(row.status),
    ubicacion: row.location ?? "—",
  }
}

// ============================================================================
// Stats adapter
// ============================================================================

export type StatKey = "total" | "activas" | "hoy" | "facturado"

export type AdaptedReservationStat = {
  key: StatKey
  label: string
  value: string
  accent: string
  bg: string
  text: string
}

const STAT_META: Record<StatKey, Omit<AdaptedReservationStat, "value">> = {
  total: {
    key: "total",
    label: "Reservas totales",
    accent: "border-blue-500/30",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
  },
  activas: {
    key: "activas",
    label: "Activas",
    accent: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
  },
  hoy: {
    key: "hoy",
    label: "Hoy",
    accent: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
  },
  facturado: {
    key: "facturado",
    label: "Facturado",
    accent: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
  },
}

export function adaptStats(stats: ReservationStats): AdaptedReservationStat[] {
  const values: string[] = [
    String(stats.total),
    String(stats.activas),
    String(stats.hoy),
    formatCurrency(stats.facturado),
  ]
  return (Object.keys(STAT_META) as StatKey[]).map((key, i) => ({
    ...STAT_META[key],
    value: values[i] ?? "0",
  }))
}