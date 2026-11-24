import { createClient } from "@/lib/supabase/server";

export type TipoCliente = "registrado" | "invitado";

type ClienteAcumulador = CLIENTE & {
  reservationStatuses: string[];
};
 
export type EstadoCliente = "pendiente_pago" | "activo" | "finalizado";

export type CLIENTE = {
  id: string | null;
  nombre: string;
  email: string;
  telefono: string;
  tipo: TipoCliente;
  estado: EstadoCliente;
  reservas: number;
  totalPagado: number;
  ultimaReserva: string;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Suma de pagos `completado` por reserva (lo realmente pagado). */
async function getPaidAmountByReservation(
  supabase: SupabaseServerClient,
  reservationIds: string[],
): Promise<Map<string, number>> {
  const paid = new Map<string, number>();
  if (reservationIds.length === 0) return paid;

  const { data, error } = await supabase
    .from("pagos")
    .select("reservation_id, monto")
    .eq("estado", "completado")
    .in("reservation_id", reservationIds);

  if (error) {
    console.error("[clients] Error obteniendo pagos:", error.message);
    return paid;
  }

  for (const row of data ?? []) {
    const id = String(row.reservation_id);
    paid.set(id, (paid.get(id) ?? 0) + Number(row.monto));
  }
  return paid;
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

 const estadosValidos = [
   "pendiente_pago",
   "confirmada",
   "activa",
   "finalizada",
 ];

  const paidByReservation = await getPaidAmountByReservation(
    supabase,
    reservaciones.map((reservacion) => String(reservacion.id)),
  );

  const clientsMap = new Map<string, ClienteAcumulador>();

  for (const reservacion of reservaciones) {
    if (!estadosValidos.includes(reservacion.status)) {
      continue;
    }

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

    client.reservas++;

    client.totalPagado += paidByReservation.get(String(reservacion.id)) ?? 0;

    if (new Date(reservacion.created_at) > new Date(client.ultimaReserva)) {
      client.ultimaReserva = reservacion.created_at;
    }
    client.reservationStatuses.push(reservacion.status);
  }

  for (const client of clientsMap.values()) {
    if (
      client.reservationStatuses.some(
        (status) => status === "activa" || status === "confirmada",
      )
    ) {
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ reservationStatuses, ...client }) => client,
  );
}





export async function getClientDetails(clientId: string) {
  const supabase = await createClient();

  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

 
  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("created_by", user.id);

  if (vehiclesError || !vehicles) {
    console.error("Error obteniendo vehículos:", vehiclesError);
    return null;
  }

  const vehicleIds = vehicles.map((vehicle) => vehicle.id);

  if (vehicleIds.length === 0) {
    return null;
  }




  
  const { data: reservations, error: reservationsError } = await supabase
    .from("reservations")
    .select(
      `
      id,
      numero,
      client_id,
      client_name,
      client_email,
      client_phone,
      start_date,
      end_date,
      total_price,
      status,
      created_at,
      vehicle:vehicles (
        brand,
        model
      )
    `,
    )
    .eq("client_id", clientId)
    .in("vehicle_id", vehicleIds)
    .order("created_at", { ascending: false });

  if (reservationsError) {
    console.error("Error obteniendo historial:", reservationsError);
    return null;
  }

  if (!reservations || reservations.length === 0) {
    return null;
  }





  const firstReservation = reservations[0];

  const paidByReservation = await getPaidAmountByReservation(
    supabase,
    reservations.map((reservation) => String(reservation.id)),
  );

  const client: CLIENTE = {
    id: firstReservation.client_id,
    nombre: firstReservation.client_name,
    email: firstReservation.client_email ?? "",
    telefono: firstReservation.client_phone ?? "",
    tipo: "registrado",
    estado: reservations.some(
      (r) => r.status === "activa" || r.status === "confirmada",
    )
      ? "activo"
      : reservations.every((r) => r.status === "finalizada")
        ? "finalizado"
        : "pendiente_pago",
    reservas: reservations.length,
    totalPagado: reservations.reduce(
      (total, reservation) =>
        total + (paidByReservation.get(String(reservation.id)) ?? 0),
      0,
    ),
    ultimaReserva: firstReservation.created_at,
  };

  



  const totalGastado = reservations.reduce(
    (total, reservation) => total + Number(reservation.total_price),
    0,
  );

  return {
    client,
    reservations,
    totalGastado,
  };
}