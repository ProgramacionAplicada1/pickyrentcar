import { createClient } from "@/lib/supabase/server";

export type ClientType = "registrado" | "invitado";

type ClientAccumulator = ClientListItem & {
  reservationStatuses: string[];
};

export type ClientStatus = "pendiente_pago" | "activo" | "finalizado";

export type ClientListItem = {
  id: string | null;
  nombre: string;
  email: string;
  telefono: string;
  tipo: ClientType;
  estado: ClientStatus;
  reservas: number;
  totalPagado: number;
  ultimaReserva: string;
};

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

  const { data: reservations, error: reservationsError } = await supabase

    .from("reservations")
    .select("*")
    .in("vehicle_id", vehicleIds);

  if (reservationsError || !reservations) {
    return [];
  }

 const clientsMap = new Map<string, ClientAccumulator>();

  for (const reservation of reservations) {
    const key = reservation.client_id
      ? reservation.client_id
      : (reservation.client_email?.toLowerCase() ?? reservation.client_phone);

    if (!clientsMap.has(key)) {
      clientsMap.set(key, {
        id: reservation.client_id,
        nombre: reservation.client_name,
        email: reservation.client_email,
        telefono: reservation.client_phone,
        tipo: reservation.client_id ? "registrado" : "invitado",
        
        estado: "pendiente_pago",
        
        reservas: 0,
        totalPagado: 0,
        ultimaReserva: reservation.created_at,
        reservationStatuses: []
      });
    }

    const client = clientsMap.get(key)!;

    client.reservas++;

    client.totalPagado += Number(reservation.total_price);

    if (new Date(reservation.created_at) > new Date(client.ultimaReserva)) {
      client.ultimaReserva = reservation.created_at;
    }
    client.reservationStatuses.push(reservation.status);
  }
    
    for (const client of clientsMap.values()) {
      if (client.reservationStatuses.includes("activa")) {
        client.estado = "activo";
      } else if (
        client.reservationStatuses.every((status) => status === "finalizada")
      ) {
        client.estado = "finalizado";
      } else {
        client.estado = "pendiente_pago";
      }
    }
    
    
    return Array.from(clientsMap.values()).map(
      ({ reservationStatuses, ...client }) => client,
    );
}
