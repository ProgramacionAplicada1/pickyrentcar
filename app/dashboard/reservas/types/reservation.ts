export interface Reservation {
  id: string
  vehicleId: string

  numeroReserva: string

  cliente: string
  correo: string
  telefono: string

  vehiculo: string
  nombreVehiculo: string | null
  tipoVehiculo: string
  placa: string
  anio: number | null
  color: string | null
  asientos: number | null
  transmision: string
  combustible: string
  imagen: string | null
  estadoVehiculo: string

  fechaInicio: string
  fechaFin: string
  dias: number

  precioDiario: number
  precio: number

  estado: string
  notas: string | null
  ubicacion: string

  // Todavía no existen en la tabla reservations.
  metodoPago: string | null
  estadoPago: string | null

  createdAt: string
  updatedAt: string
}