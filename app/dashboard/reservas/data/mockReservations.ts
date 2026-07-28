export type ReservationStatus =
  | "Activa"
  | "Pendiente"
  | "Finalizada"
  | "Cancelada";

export type PaymentStatus =
  | "Pagado"
  | "Pendiente"
  | "Parcial";

export type PaymentMethod =
  | "Tarjeta"
  | "Efectivo"
  | "Transferencia";

export interface Reservation {
  id: number;

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

  estado: ReservationStatus;

  metodoPago: PaymentMethod;
  estadoPago: PaymentStatus;

  ubicacion: string;
}

export const mockReservations: Reservation[] = [
  {
    id: 1,
    numeroReserva: "PKR-2026-0001",

    cliente: "Juan Pérez",
    correo: "juan@gmail.com",
    telefono: "(809) 555-1234",

    vehiculo: "Toyota Corolla 2024",
    tipoVehiculo: "Sedán",
    placa: "A123456",
    transmision: "Automático",
    combustible: "Gasolina",

    imagen: "/images/vehicles/corolla.jpg",

    fechaInicio: "15 Jul 2026",
    fechaFin: "18 Jul 2026",
    dias: 3,

    precio: 18500,

    estado: "Activa",

    metodoPago: "Tarjeta",
    estadoPago: "Pagado",

    ubicacion: "Sucursal San Francisco",
  },

  {
    id: 2,
    numeroReserva: "PKR-2026-0002",

    cliente: "María Rodríguez",
    correo: "maria@gmail.com",
    telefono: "(829) 555-5678",

    vehiculo: "Honda Civic 2023",
    tipoVehiculo: "Sedán",
    placa: "B654321",
    transmision: "Automático",
    combustible: "Gasolina",

    imagen: "/images/vehicles/civic.jpg",

    fechaInicio: "20 Jul 2026",
    fechaFin: "24 Jul 2026",
    dias: 4,

    precio: 22000,

    estado: "Pendiente",

    metodoPago: "Transferencia",
    estadoPago: "Pendiente",

    ubicacion: "Sucursal Santiago",
  },

  {
    id: 3,
    numeroReserva: "PKR-2026-0003",

    cliente: "Carlos Fernández",
    correo: "carlos@gmail.com",
    telefono: "(849) 555-1111",

    vehiculo: "Hyundai Tucson 2025",
    tipoVehiculo: "SUV",
    placa: "C789654",
    transmision: "Automático",
    combustible: "Gasolina",

    imagen: "/images/vehicles/tucson.jpg",

    fechaInicio: "08 Jul 2026",
    fechaFin: "12 Jul 2026",
    dias: 4,

    precio: 28000,

    estado: "Finalizada",

    metodoPago: "Efectivo",
    estadoPago: "Pagado",

    ubicacion: "Sucursal Santo Domingo",
  },

  {
    id: 4,
    numeroReserva: "PKR-2026-0004",

    cliente: "Ana Gómez",
    correo: "ana@gmail.com",
    telefono: "(809) 555-4444",

    vehiculo: "Kia Sportage 2024",
    tipoVehiculo: "SUV",
    placa: "D321654",
    transmision: "Automático",
    combustible: "Gasolina",

    imagen: "/images/vehicles/sportage.jpg",

    fechaInicio: "01 Jul 2026",
    fechaFin: "05 Jul 2026",
    dias: 4,

    precio: 25000,

    estado: "Cancelada",

    metodoPago: "Tarjeta",
    estadoPago: "Parcial",

    ubicacion: "Sucursal La Vega",
  },

  {
    id: 5,
    numeroReserva: "PKR-2026-0005",

    cliente: "Pedro Martínez",
    correo: "pedro@gmail.com",
    telefono: "(829) 555-9999",

    vehiculo: "Chevrolet Tahoe 2025",
    tipoVehiculo: "SUV",
    placa: "E987654",
    transmision: "Automático",
    combustible: "Gasolina",

    imagen: "/images/vehicles/tahoe.jpg",

    fechaInicio: "28 Jul 2026",
    fechaFin: "31 Jul 2026",
    dias: 3,

    precio: 36500,

    estado: "Activa",

    metodoPago: "Transferencia",
    estadoPago: "Pagado",

    ubicacion: "Sucursal Puerto Plata",
  },
];