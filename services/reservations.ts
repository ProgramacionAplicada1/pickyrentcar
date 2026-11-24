import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  PAYMENT_WINDOW_HOURS,
  canCancelReservation,
  isReservationStatus,
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
  payment_due_at: string | null;
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
  /** Pagadas y vigentes: confirmadas + en curso. */
  activas: number;
  hoy: number;
  facturado: number;
};

export type ReservationMutationResult = {
  ok: boolean;
  error?: string;
};

const RESERVATION_SELECT =
  "id, numero, client_name, client_email, client_phone, start_date, end_date, days, daily_price, total_price, status, payment_due_at, notes, location, created_at, updated_at, vehicles:vehicle_id(id, brand, model, year, plate, image_urls, nombre, status, category, transmission, fuel_type)";

const OVERLAP_ERROR =
  "Las fechas de esta reserva se cruzan con otra reserva confirmada o por pagar del mismo vehículo.";

// ============================================================================
// Helpers
// ============================================================================

function normalizeImageUrls(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Cancela las reservas "por pagar" cuyo plazo venció sin pago reportado.
 * Es perezoso: se ejecuta antes de listar o de cambiar estados.
 */
export async function expireOverdueReservations(
  supabase?: SupabaseServerClient,
): Promise<void> {
  const client = supabase ?? (await createClient());
  const { error } = await client.rpc("cancel_expired_reservations");
  if (error) {
    // Si la migración 022 aún no está aplicada, no rompemos la página.
    console.error("[reservations] cancel_expired_reservations:", error.message);
  }
}

function paymentDueFromNow(): string {
  return new Date(
    Date.now() + PAYMENT_WINDOW_HOURS * 60 * 60 * 1000,
  ).toISOString();
}

function mapReservationRow(row: Record<string, unknown>): ReservationRow {
  const rawVehicle = row.vehicles;
  const vehicle = (
    Array.isArray(rawVehicle) ? rawVehicle[0] : rawVehicle
  ) as Partial<ReservationRow["vehicle"]> | null;

  return {
    id: String(row.id),
    numero: String(row.numero),
    client_name: String(row.client_name),
    client_email: (row.client_email as string | null) ?? null,
    client_phone: String(row.client_phone ?? ""),
    start_date: String(row.start_date),
    end_date: String(row.end_date),
    days: Number(row.days),
    daily_price: Number(row.daily_price),
    total_price: Number(row.total_price),
    status: String(row.status),
    payment_due_at: (row.payment_due_at as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
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
  };
}

async function getOwnedVehicleIds(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<string[]> {
  // Defensa en profundidad: además de RLS, filtramos por vehículos propios.
  const { data } = await supabase
    .from("vehicles")
    .select("id")
    .eq("created_by", userId);
  return (data ?? []).map((v) => String((v as { id: string }).id));
}

/** ¿El rango sigue libre (ignorando la propia reserva)? */
async function isRangeAvailable(
  supabase: SupabaseServerClient,
  reservationId: string,
): Promise<boolean> {
  const { data: row } = await supabase
    .from("reservations")
    .select("vehicle_id, start_date, end_date, status")
    .eq("id", reservationId)
    .maybeSingle();
  if (!row) return false;

  // Si la propia reserva ya aparta fechas, el RPC la contaría como conflicto:
  // comprobamos contra las demás reservas directamente.
  const { data: others, error } = await supabase
    .from("reservations")
    .select("id")
    .eq("vehicle_id", row.vehicle_id)
    .neq("id", reservationId)
    .in("status", ["pendiente_pago", "confirmada", "activa"])
    .lte("start_date", row.end_date)
    .gte("end_date", row.start_date)
    .limit(1);

  if (error) return true; // el EXCLUDE de la BD es la última barrera
  return (others ?? []).length === 0;
}

// ============================================================================
// Queries
// ============================================================================

export async function listReservations(): Promise<ReservationRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  await expireOverdueReservations(supabase);

  const ownedVehicleIds = await getOwnedVehicleIds(supabase, user.id);
  if (ownedVehicleIds.length === 0) return [];

  const { data } = await supabase
    .from("reservations")
    .select(RESERVATION_SELECT)
    .in("vehicle_id", ownedVehicleIds)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) =>
    mapReservationRow(row as Record<string, unknown>),
  );
}

export async function getReservationById(
  id: string,
): Promise<ReservationRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  await expireOverdueReservations(supabase);

  const ownedVehicleIds = await getOwnedVehicleIds(supabase, user.id);
  if (ownedVehicleIds.length === 0) return null;

  const { data } = await supabase
    .from("reservations")
    .select(RESERVATION_SELECT)
    .eq("id", id)
    .in("vehicle_id", ownedVehicleIds)
    .maybeSingle();

  return data ? mapReservationRow(data as Record<string, unknown>) : null;
}

export async function getReservationsByStatus() {
  const reservations = await listReservations();

  const estados = [
    "pendiente",
    "pendiente_pago",
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

  const total = reservations.length;
  const activas = reservations.filter(
    (r) => r.status === "confirmada" || r.status === "activa",
  ).length;
  const hoy = reservations.filter(
    (r) =>
      r.status !== "cancelada" &&
      r.start_date <= todayIso &&
      r.end_date >= todayIso,
  ).length;
  const facturado = await getTotalFacturadoFromCompletedPagos(
    reservations.map((reservation) => reservation.id),
  );

  return { total, activas, hoy, facturado };
}

/** IDs de reservas con al menos un pago completado. */
export async function getReservationsWithPaymentStatus(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pagos")
    .select("reservation_id")
    .eq("estado", "completado");
  return new Set(
    (data ?? []).map((row) =>
      String((row as { reservation_id: string }).reservation_id),
    ),
  );
}

/** IDs de reservas con un pago reportado pendiente de revisión. */
export async function getReservationsWithPendingPayment(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pagos")
    .select("reservation_id")
    .eq("estado", "pendiente");
  return new Set(
    (data ?? []).map((row) =>
      String((row as { reservation_id: string }).reservation_id),
    ),
  );
}

async function getTotalFacturadoFromCompletedPagos(
  reservationIds: string[],
): Promise<number> {
  if (reservationIds.length === 0) return 0;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pagos")
    .select("monto")
    .eq("estado", "completado")
    .in("reservation_id", reservationIds);

  if (error) {
    console.error("[reservations] Error obteniendo facturación:", error.message);
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

/**
 * Avanza la reserva al siguiente estado manual:
 *   pendiente → pendiente_pago (acepta y abre el plazo de pago)
 *   confirmada → activa (entrega del vehículo)
 *   activa → finalizada
 * pendiente_pago → confirmada solo ocurre al confirmar un pago.
 */
export async function advanceReservationStatus(
  reservationId: string,
): Promise<ReservationMutationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  await expireOverdueReservations(supabase);

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

  if (current === "pendiente_pago") {
    return {
      ok: false,
      error: "La reserva se confirma al aprobar el pago del cliente.",
    };
  }

  const next = nextReservationStatus(current);
  if (!next) {
    return { ok: false, error: "No hay siguiente estado disponible." };
  }

  if (current === "pendiente" && !(await isRangeAvailable(supabase, reservationId))) {
    return { ok: false, error: OVERLAP_ERROR };
  }

  const update: { status: string; payment_due_at?: string } = { status: next };
  if (next === "pendiente_pago") {
    update.payment_due_at = paymentDueFromNow();
  }

  const { error } = await supabase
    .from("reservations")
    .update(update)
    .eq("id", reservationId);

  if (error) {
    console.error("[reservations] Error al avanzar el estado:", error.message);
    return {
      ok: false,
      error:
        error.code === "23P01"
          ? OVERLAP_ERROR
          : "No se pudo actualizar el estado de la reserva.",
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

  const { data: row } = await supabase
    .from("reservations")
    .select("status")
    .eq("id", reservationId)
    .maybeSingle();

  const current = (row as { status: string } | null)?.status ?? "";
  if (!isReservationStatus(current) || !canCancelReservation(current)) {
    return { ok: false, error: "Esta reserva ya no se puede cancelar." };
  }

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

/** Usado por payments al confirmar un pago (pendiente_pago → confirmada). */
export async function confirmReservationAfterPayment(
  reservationId: string,
): Promise<ReservationMutationResult> {
  const supabase = await createClient();

  await expireOverdueReservations(supabase);
  if (!(await isRangeAvailable(supabase, reservationId))) {
    return { ok: false, error: OVERLAP_ERROR };
  }

  const { error } = await supabase
    .from("reservations")
    .update({ status: "confirmada" })
    .eq("id", reservationId)
    .eq("status", "pendiente_pago");

  if (error) {
    console.error("[reservations] Error al confirmar la reserva:", error.message);
    return {
      ok: false,
      error:
        error.code === "23P01"
          ? OVERLAP_ERROR
          : "No se pudo confirmar la reserva.",
    };
  }
  return { ok: true };
}

/** Tras rechazar un pago, el cliente tiene un plazo nuevo para pagar. */
export async function reopenPaymentWindow(reservationId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("reservations")
    .update({ payment_due_at: paymentDueFromNow() })
    .eq("id", reservationId)
    .eq("status", "pendiente_pago");
}
