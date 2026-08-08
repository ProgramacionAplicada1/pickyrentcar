import { createClient } from "@/lib/supabase/server";

export type TipoCliente = "registrado" | "invitado";

type ClienteAcumulador = CLIENTE & {
  reservationStatuses: string[];
};

export type EstadoCliente = "pendiente_pago" | "activo" | "finalizado";

export type CLIENTE = {
  id: string | null,
  nombre: string,
  email: string,
  telefono: string,
  tipo: TipoCliente,
  estado: EstadoCliente,
  reservas: number,
  totalPagado: number,
  ultimaReserva: string,
}


export async function getClientsByOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("created_by", user.id);

  if (vehiclesError || !vehicles) {
    return [];
  }

  const vehicleIds = vehicles.map((vehicle) => vehicle.id);

  if (vehicleIds.length === 0) {
    return [];
  }

  const { data: reservaciones, error: reservationsError } = await supabase
    .from("reservations")
    .select("*")
    .in("vehicle_id", vehicleIds);

  if (reservationsError || !reservaciones) {
    return [];
  }

  const clientsMap = new Map<string, ClienteAcumulador>();

  for (const reservacion of reservaciones) {
    const key = reservacion.client_id
      ? reservacion.client_id
      : (reservacion.client_email?.toLowerCase() ?? reservacion.client_phone);

    if (!clientsMap.has(key)) {
      clientsMap.set(key, {
        id: reservacion.client_id,
        nombre: reservacion.client_name,
        email: reservacion.client_email,
        telefono: reservacion.client_phone,
        tipo: reservacion.client_id ? "registrado" : "invitado",

        estado: "pendiente_pago",

        reservas: 0,
        totalPagado: 0,
        ultimaReserva: reservacion.created_at,
        reservationStatuses: [],
      });
    }

    const client = clientsMap.get(key)!;

    client.reservas++

    client.totalPagado += Number(reservacion.total_price)

    if (new Date(reservacion.created_at) > new Date(client.ultimaReserva)) {
      client.ultimaReserva = reservacion.created_at;
    }
    client.reservationStatuses.push(reservacion.status);
  }

  for (const client of clientsMap.values()) {
    if (client.reservationStatuses.includes("activa")) {
      client.estado = "activo";
    } else if (
      client.reservationStatuses.every((status) => status === "finalizada")
    ) {
      client.estado = "finalizado"
    } else {
      client.estado = "pendiente_pago"
    }
  }

  return Array.from(clientsMap.values()).map(
    ({ reservationStatuses, ...client }) => client,
  );
}
