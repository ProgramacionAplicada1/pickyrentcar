import type { Reservation } from "../types/reservation"

export interface VehicleDatabaseRow {
  id: string
  nombre: string | null
  plate: string | null
  brand: string | null
  model: string | null
  year: number | null
  color: string | null
  seats: number | null
  status: string | null
  daily_price: number | string | null
  transmission: string | null
  fuel_type: string | null
  category: string | null
  image_urls: string[] | null
}

export interface ReservationDatabaseRow {
  id: string
  numero: string | null
  vehicle_id: string

  client_name: string | null
  client_email: string | null
  client_phone: string | null

  start_date: string
  end_date: string
  days: number | null

  daily_price: number | string | null
  total_price: number | string | null

  status: string | null
  notes: string | null
  location: string | null

  created_at: string
  updated_at: string

  vehicle: VehicleDatabaseRow | null
}

const reservationStatusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  pending: "Pendiente",

  activa: "Activa",
  activo: "Activa",
  active: "Activa",

  confirmada: "Confirmada",
  confirmado: "Confirmada",
  confirmed: "Confirmada",

  finalizada: "Finalizada",
  finalizado: "Finalizada",
  completed: "Finalizada",
  completada: "Finalizada",

  cancelada: "Cancelada",
  cancelado: "Cancelada",
  cancelled: "Cancelada",
  canceled: "Cancelada",
}

function normalizeReservationStatus(status: string | null) {
  if (!status) return "Pendiente"

  const normalizedStatus = status.trim().toLowerCase()

  return (
    reservationStatusLabels[normalizedStatus] ??
    status.charAt(0).toUpperCase() + status.slice(1)
  )
}

function createVehicleName(vehicle: VehicleDatabaseRow | null) {
  if (!vehicle) {
    return "Vehículo no disponible"
  }

  const name = [vehicle.brand, vehicle.model]
    .filter(Boolean)
    .join(" ")
    .trim()

  return name || vehicle.nombre || "Vehículo sin nombre"
}

export function mapReservation(
  row: ReservationDatabaseRow
): Reservation {
  const vehicle = row.vehicle

  return {
    id: row.id,
    vehicleId: row.vehicle_id,

    numeroReserva:
      row.numero ?? `PKR-${row.id.slice(0, 8).toUpperCase()}`,

    cliente: row.client_name ?? "Cliente no especificado",
    correo: row.client_email ?? "Correo no registrado",
    telefono: row.client_phone ?? "Teléfono no registrado",

    vehiculo: createVehicleName(vehicle),
    nombreVehiculo: vehicle?.nombre ?? null,
    tipoVehiculo: vehicle?.category ?? "Sin categoría",
    placa: vehicle?.plate ?? "Sin placa",
    anio: vehicle?.year ?? null,
    color: vehicle?.color ?? null,
    asientos: vehicle?.seats ?? null,
    transmision: vehicle?.transmission ?? "No especificada",
    combustible: vehicle?.fuel_type ?? "No especificado",
    imagen: vehicle?.image_urls?.[0] ?? null,
    estadoVehiculo: vehicle?.status ?? "Sin estado",

    fechaInicio: row.start_date,
    fechaFin: row.end_date,
    dias: Number(row.days ?? 0),

    precioDiario: Number(
      row.daily_price ?? vehicle?.daily_price ?? 0
    ),

    precio: Number(row.total_price ?? 0),

    estado: normalizeReservationStatus(row.status),
    notas: row.notes,
    ubicacion: row.location ?? "Ubicación no especificada",

    metodoPago: null,
    estadoPago: null,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}