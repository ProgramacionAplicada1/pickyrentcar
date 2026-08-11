import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  RESERVATION_STATUSES,
  type ReservationStatus,
  nextReservationStatus,
} from "@/lib/vehicles/reservation-status";

// ============================================================================
// Types
// ============================================================================

export type ReservationRow = {
  id: string;
  numero: string;
  client_name: string;
  client_email: string | null;
  client_phone: string;
  start_date: string;
  end_date: string;
  days: number;
  daily_price: number;
  total_price: number;
  status: string;
  notes: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    year: number;
    plate: string;
    image_urls: string[];
    nombre: string | null;
    status: string;
    category: string;
    transmission: string;
    fuel_type: string;
  };
};

export type ReservationStats = {
  total: number;
  activas: number;
  hoy: number;
  facturado: number;
};

export type ReservationMutationResult = {
  ok: boolean;
  error?: string;
};

// ============================================================================
// Helpers
// ============================================================================

function isReservationStatus(value: string): value is ReservationStatus {
  return (RESERVATION_STATUSES as readonly string[]).includes(value);
}

function normalizeImageUrls(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

// ============================================================================
// Queries
// ============================================================================

export async function listReservations(
  startDate?: string,
  endDate?: string,
): Promise<ReservationRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Defense-in-depth: pre-fetch IDs de vehículos del admin y filtrar
  // por ellos. Aunque RLS esté roto (ej. política huérfana), esto limita
  // el resultado a vehículos propios.
  const { data: ownedVehicles } = await supabase
    .from("vehicles")
    .select("id")
    .eq("created_by", user.id);
  const ownedVehicleIds = (ownedVehicles ?? []).map((v) =>
    String((v as { id: string }).id),
  );
  if (ownedVehicleIds.length === 0) return [];

  const { data } = await supabase
    .from("reservations")
    .select(
      "id, numero, client_name, client_email, client_phone, start_date, end_date, days, daily_price, total_price, status, notes, location, created_at, updated_at, vehicles:vehicle_id(id, brand, model, year, plate, image_urls, nombre, status, category, transmission, fuel_type)",
    )
    .in("vehicle_id", ownedVehicleIds)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const rawVehicle = (row as { vehicles: unknown }).vehicles;
    const vehicle = Array.isArray(rawVehicle)
      ? rawVehicle[0]
      : (rawVehicle as ReservationRow["vehicle"] | null);

    return {
      id: String((row as { id: string }).id),
      numero: String((row as { numero: string }).numero),
      client_name: String((row as { client_name: string }).client_name),
      client_email:
        (row as { client_email: string | null }).client_email ?? null,
      client_phone: String((row as { client_phone: string }).client_phone),
      start_date: String((row as { start_date: string }).start_date),
      end_date: String((row as { end_date: string }).end_date),
      days: Number((row as { days: number }).days),
      daily_price: Number((row as { daily_price: number }).daily_price),
      total_price: Number((row as { total_price: number }).total_price),
      status: String((row as { status: string }).status),
      notes: (row as { notes: string | null }).notes ?? null,
      location: (row as { location: string | null }).location ?? null,
      created_at: String((row as { created_at: string }).created_at),
      updated_at: String((row as { updated_at: string }).updated_at),
      vehicle: {
        id: String(vehicle?.id ?? ""),
        brand: String(vehicle?.brand ?? ""),
        model: String(vehicle?.model ?? ""),
        year: Number(vehicle?.year ?? 0),
        plate: String(vehicle?.plate ?? ""),
        image_urls: normalizeImageUrls(vehicle?.image_urls),
        nombre: vehicle?.nombre ?? null,
        status: String(vehicle?.status ?? ""),
        category: String(vehicle?.category ?? ""),
        transmission: String(vehicle?.transmission ?? ""),
        fuel_type: String(vehicle?.fuel_type ?? ""),
      },
    } satisfies ReservationRow;
  });
}

export async function getReservationById(
  id: string,
): Promise<ReservationRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Defense-in-depth: pre-fetch owned vehicle IDs y filtrar.
  const { data: ownedVehicles } = await supabase
    .from("vehicles")
    .select("id")
    .eq("created_by", user.id);
  const ownedVehicleIds = (ownedVehicles ?? []).map((v) =>
    String((v as { id: string }).id),
  );
  if (ownedVehicleIds.length === 0) return null;

  const { data } = await supabase
    .from("reservations")
    .select(
      "id, numero, client_name, client_email, client_phone, start_date, end_date, days, daily_price, total_price, status, notes, location, created_at, updated_at, vehicles:vehicle_id(id, brand, model, year, plate, image_urls, nombre, status, category, transmission, fuel_type)",
    )
    .eq("id", id)
    .in("vehicle_id", ownedVehicleIds)
    .maybeSingle();

  if (!data) return null;

  const rawVehicle = (data as { vehicles: unknown }).vehicles;
  const vehicle = Array.isArray(rawVehicle)
    ? rawVehicle[0]
    : (rawVehicle as ReservationRow["vehicle"] | null);

  return {
    id: String((data as { id: string }).id),
    numero: String((data as { numero: string }).numero),
    client_name: String((data as { client_name: string }).client_name),
    client_email:
      (data as { client_email: string | null }).client_email ?? null,
    client_phone: String((data as { client_phone: string }).client_phone),
    start_date: String((data as { start_date: string }).start_date),
    end_date: String((data as { end_date: string }).end_date),
    days: Number((data as { days: number }).days),
    daily_price: Number((data as { daily_price: number }).daily_price),
    total_price: Number((data as { total_price: number }).total_price),
    status: String((data as { status: string }).status),
    notes: (data as { notes: string | null }).notes ?? null,
    location: (data as { location: string | null }).location ?? null,
    created_at: String((data as { created_at: string }).created_at),
    updated_at: String((data as { updated_at: string }).updated_at),
    vehicle: {
      id: String(vehicle?.id ?? ""),
      brand: String(vehicle?.brand ?? ""),
      model: String(vehicle?.model ?? ""),
      year: Number(vehicle?.year ?? 0),
      plate: String(vehicle?.plate ?? ""),
      image_urls: normalizeImageUrls(vehicle?.image_urls),
      nombre: vehicle?.nombre ?? null,
      status: String(vehicle?.status ?? ""),
      category: String(vehicle?.category ?? ""),
      transmission: String(vehicle?.transmission ?? ""),
      fuel_type: String(vehicle?.fuel_type ?? ""),
    },
  } satisfies ReservationRow;
}

export async function getReservationsByStatus() {
  const reservations = await listReservations();

  const estados = [
    "pendiente",
    "confirmada",
    "activa",
    "finalizada",
    "cancelada",
  ];

  return estados.map((estado) => ({
    estado,
    cantidad: reservations.filter(
      (reservation) => reservation.status === estado,
    ).length,
  }));
}

export async function getReservationStats(): Promise<ReservationStats> {
  const reservations = await listReservations();
  const todayIso = new Date().toISOString().slice(0, 10);

  // Reservas con al menos un pago completado (auto-promoción + gate).
  const reservationsWithPaidPayment =
    await getReservationIdsWithCompletedPayment();

  const total = reservations.length;
  const activas = reservations.filter(
    (r) =>
      (r.status === "confirmada" || r.status === "activa") &&
      reservationsWithPaidPayment.has(r.id),
  ).length;
  const hoy = reservations.filter(
    (r) => r.start_date <= todayIso && r.end_date >= todayIso,
  ).length;
  const facturado = await getTotalFacturadoFromCompletedPagos(
  reservations.map((reservation) => reservation.id),
);

  return { total, activas, hoy, facturado };
}

// ============================================================================
// Internal helpers (payments-aware stats)
// ============================================================================

async function getReservationIdsWithCompletedPayment(): Promise<Set<string>> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("pagos")
    .select("reservation_id")
    .eq("estado", "completado");
  const ids = new Set<string>();
  for (const row of data ?? []) {
    ids.add(String((row as { reservation_id: string }).reservation_id));
  }
  return ids;
}

export async function getReservationsWithPaymentStatus(): Promise<Set<string>> {
  return getReservationIdsWithCompletedPayment();
}

async function getTotalFacturadoFromCompletedPagos(
  reservationIds: string[],
): Promise<number> {
  if (reservationIds.length === 0) {
    return 0;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pagos")
    .select("monto")
    .eq("estado", "completado")
    .in("reservation_id", reservationIds);

  if (error) {
    console.error("ERROR OBTENIENDO FACTURACIÓN:", error);
    return 0;
  }

  return (data ?? []).reduce(
    (acc, row) => acc + Number((row as { monto: number }).monto),
    0,
  );
}
// ============================================================================
// Mutations
// ============================================================================



export async function advanceReservationStatus(
  reservationId: string,
): Promise<ReservationMutationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const { data: row } = await supabase
    .from("reservations")
    .select("status")
    .eq("id", reservationId)
    .maybeSingle();

  if (!row) return { ok: false, error: "La reserva no existe." };

  const current = (row as { status: string }).status;
  if (!isReservationStatus(current)) {
    return { ok: false, error: "Estado actual no reconocido." };
  }

  const next = nextReservationStatus(current);

  console.log("ESTADO ACTUAL:", current);
  console.log("SIGUIENTE ESTADO:", next);
  console.log("RESERVA:", reservationId);
  
  if (!next) {
    return { ok: false, error: "No hay siguiente estado disponible." };
  }

  const { error } = await supabase
    .from("reservations")
    .update({ status: next })
    .eq("id", reservationId);

  if (error) {
    console.error("ERROR ACTUALIZANDO RESERVA:", error);

    return {
      ok: false,
      error: error.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reservas");
  revalidatePath(`/dashboard/reservas/${reservationId}`);
  return { ok: true };
}



export async function cancelReservation(
  reservationId: string,
): Promise<ReservationMutationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const { error } = await supabase
    .from("reservations")
    .update({ status: "cancelada" })
    .eq("id", reservationId);

  if (error) {
    return { ok: false, error: "No se pudo cancelar la reserva." };
  }

  revalidatePath("/dashboard/reservas");
  revalidatePath(`/dashboard/reservas/${reservationId}`);
  return { ok: true };
}
