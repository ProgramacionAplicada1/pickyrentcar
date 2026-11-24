export type AdaptedReservationStatus =
  | "Pendiente"
  | "Por pagar"
  | "Pago en revisión"
  | "Confirmada"
  | "En curso"
  | "Finalizada"
  | "Cancelada";

export type PaymentStatus = "Pagado" | "Pendiente" | "En revisión" | "Rechazado";

export type PaymentMethod = "Tarjeta" | "Efectivo" | "Transferencia";

export interface Reservation {
  id: string;

  numeroReserva: string;

  cliente: string;
  correo: string;
  telefono: string;
  fotoCliente?: string;

  vehiculo: string;
  tipoVehiculo: string;
  placa: string;
  transmision: "Automático" | "Manual";
  combustible: "Gasolina" | "Diésel" | "Híbrido" | "Eléctrico";

  imagen: string;

  fechaInicio: string;
  fechaFin: string;
  dias: number;

  precio: number;

  estado: AdaptedReservationStatus;

  metodoPago: PaymentMethod | "—";
  estadoPago: PaymentStatus;

  ubicacion: string;
}
