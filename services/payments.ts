import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

// ============================================================================
// Types
// ============================================================================

export const PAGO_ESTADOS = [
  "pendiente",
  "completado",
  "fallido",
  "reembolsado",
] as const

export type PagoEstado = (typeof PAGO_ESTADOS)[number]

export const PAGO_METODOS = ["Efectivo", "Transferencia"] as const
export type PagoMetodo = (typeof PAGO_METODOS)[number]

export type PagoRow = {
  id: string
  reservation_id: string
  monto: number
  metodo_pago: PagoMetodo
  estado: PagoEstado
  referencia: string | null
  notas: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type PagoRowWithReservation = PagoRow & {
  reservation: {
    numero: string
    client_name: string
    total_price: number
    status: string
  } | null
}

export type CreatePagoInput = {
  reservation_id: string
  monto: number
  metodo_pago: PagoMetodo
  estado?: PagoEstado
  referencia?: string | null
  notas?: string | null
}

export type PagoMutationResult =
  | { ok: true; pago: PagoRow }
  | { ok: false; error: string }

// ============================================================================
// Queries
// ============================================================================

export async function listPagos(): Promise<PagoRowWithReservation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pagos")
    .select(
      "id, reservation_id, monto, metodo_pago, estado, referencia, notas, created_by, created_at, updated_at, reservations:reservation_id(numero, client_name, total_price, status)",
    )
    .order("created_at", { ascending: false });

  console.log("========== LIST PAGOS ==========");
  console.log("PAGOS ADMIN:", data);
  console.log("ERROR LIST PAGOS:", error);
  console.log("================================");

  return (data ?? []).map((row) => {
    const rawReservation = (row as { reservations: unknown }).reservations;

    const reservation = Array.isArray(rawReservation)
      ? (rawReservation[0] as PagoRowWithReservation["reservation"] | undefined)
      : (rawReservation as PagoRowWithReservation["reservation"] | null);

    return {
      id: String(row.id),
      reservation_id: String(row.reservation_id),
      monto: Number(row.monto),
      metodo_pago: row.metodo_pago as PagoMetodo,
      estado: row.estado as PagoEstado,
      referencia: (row.referencia as string | null) ?? null,
      notas: (row.notas as string | null) ?? null,
      created_by: (row.created_by as string | null) ?? null,
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      reservation: reservation ?? null,
    } satisfies PagoRowWithReservation;
  });
}

export async function listPagosByReservation(
  reservationId: string,
): Promise<PagoRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("pagos")
    .select(
      "id, reservation_id, monto, metodo_pago, estado, referencia, notas, created_by, created_at, updated_at",
    )
    .eq("reservation_id", reservationId)
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => ({
    id: String(row.id),
    reservation_id: String(row.reservation_id),
    monto: Number(row.monto),
    metodo_pago: row.metodo_pago as PagoMetodo,
    estado: row.estado as PagoEstado,
    referencia: (row.referencia as string | null) ?? null,
    notas: (row.notas as string | null) ?? null,
    created_by: (row.created_by as string | null) ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }))
}

export async function getPagoById(id: string): Promise<PagoRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("pagos")
    .select(
      "id, reservation_id, monto, metodo_pago, estado, referencia, notas, created_by, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle()

  if (!data) return null
  return {
    id: String(data.id),
    reservation_id: String(data.reservation_id),
    monto: Number(data.monto),
    metodo_pago: data.metodo_pago as PagoMetodo,
    estado: data.estado as PagoEstado,
    referencia: (data.referencia as string | null) ?? null,
    notas: (data.notas as string | null) ?? null,
    created_by: (data.created_by as string | null) ?? null,
    created_at: String(data.created_at),
    updated_at: String(data.updated_at),
  }
}

export async function reservationHasCompletedPayment(
  reservationId: string,
): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("pagos")
    .select("id")
    .eq("reservation_id", reservationId)
    .eq("estado", "completado")
    .limit(1)
  return Boolean(data && data.length > 0)
}

// ============================================================================
// Mutations
// ============================================================================

export async function createPago(
  input: CreatePagoInput,
): Promise<PagoMutationResult> {
  const supabase = await createClient();

  const { data: debugAuth, error: debugError } =
    await supabase.rpc("debug_auth_context");

  console.log("DEBUG AUTH CONTEXT:", debugAuth);
  console.log("DEBUG AUTH ERROR:", debugError);

  console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("USUARIO AUTENTICADO:", user?.id);

  if (!user) {
    return {
      ok: false,
      error: "Tu sesión ha expirado. Inicia sesión de nuevo.",
    };
  }

  if (!input.reservation_id) {
    return {
      ok: false,
      error: "Selecciona una reserva.",
    };
  }

  if (!Number.isFinite(input.monto) || input.monto <= 0) {
    return {
      ok: false,
      error: "El monto debe ser mayor que 0.",
    };
  }

  if (!PAGO_METODOS.includes(input.metodo_pago)) {
    return {
      ok: false,
      error: "Método de pago inválido.",
    };
  }

 //const estado: PagoEstado = "pendiente";
 const estado: PagoEstado = input.estado ?? "pendiente";

  // Verificamos que el usuario sea dueño de la reserva
  const { data: ownsReservation, error: ownsError } = await supabase.rpc(
    "user_owns_reservation",
    {
      p_reservation_id: input.reservation_id,
    },
  );

  console.log("¿USUARIO ES DUEÑO DE LA RESERVA?:", ownsReservation);

  console.log("ERROR DE user_owns_reservation:", ownsError);

  if (ownsError) {
    return {
      ok: false,
      error: "No se pudo verificar la reserva.",
    };
  }

  if (!ownsReservation) {
    return {
      ok: false,
      error: "No tienes permiso para registrar este pago.",
    };
  }

  // ============================================================
  // INSERT DE PRUEBA
  // ============================================================

  const { data: testSession } = await supabase.auth.getSession();

  console.log("SESSION USER:", testSession.session?.user.id);

  console.log("ACCESS TOKEN EXISTE:", !!testSession.session?.access_token);


  const { data, error } = await supabase
    .from("pagos")
    .insert({
      reservation_id: input.reservation_id,
      monto: input.monto,
      metodo_pago: input.metodo_pago,
      estado,
      referencia: input.referencia ?? null,
      notas: input.notas ?? null,
      created_by: user.id,
    })
    .select(
      "id, reservation_id, monto, metodo_pago, estado, referencia, notas, created_by, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    console.error("ERROR REAL DE SUPABASE AL CREAR PAGO:", error);

    console.error("DATA DEL INSERT:", data);

    return {
      ok: false,
      error: error?.message ?? "El pago no pudo ser creado.",
    };
  }

  console.log("PAGO INSERTADO CORRECTAMENTE:", data);

  revalidatePath("/dashboard/reservas");
  revalidatePath("/dashboard/pagos");

  return {
    ok: true,
    pago: {
      id: String(data.id),
      reservation_id: String(data.reservation_id),
      monto: Number(data.monto),
      metodo_pago: data.metodo_pago as PagoMetodo,
      estado: data.estado as PagoEstado,
      referencia: (data.referencia as string | null) ?? null,
      notas: (data.notas as string | null) ?? null,
      created_by: (data.created_by as string | null) ?? null,
      created_at: String(data.created_at),
      updated_at: String(data.updated_at),
    },
  };
}



export async function getIncomeByMonth() {
  const pagos = await listPagos();

  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const ingresos = Array.from({ length: 12 }, (_, index) => ({
    mes: meses[index],
    ingresos: 0,
  }));

  pagos.forEach((pago) => {
    if (pago.estado !== "completado") return;

    const mes = new Date(pago.created_at).getMonth();

    ingresos[mes].ingresos += pago.monto;
  });

  return ingresos;
}

export async function updatePagoEstado(
  pagoId: string,
  estado: PagoEstado,
): Promise<PagoMutationResult> {
  if (!PAGO_ESTADOS.includes(estado)) {
    return { ok: false, error: "Estado de pago inválido." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pagos")
    .update({ estado })
    .eq("id", pagoId)
    .select(
      "id, reservation_id, monto, metodo_pago, estado, referencia, notas, created_by, created_at, updated_at",
    )
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: "No se pudo actualizar el estado del pago.",
    };
  }

  if (estado === "completado") {
    const { error: reservationError } = await supabase
      .from("reservations")
      .update({ status: "activa" })
      .eq("id", data.reservation_id);

   if (reservationError) {
     console.error("ERROR REAL AL CONFIRMAR RESERVA:", reservationError);

     return {
       ok: false,
       error: reservationError.message,
     };
   }
  }

revalidatePath("/dashboard/reservas");
revalidatePath("/dashboard/pagos");
revalidatePath("/dashboard/clientes");

  return {
    ok: true,
    pago: {
      id: String(data.id),
      reservation_id: String(data.reservation_id),
      monto: Number(data.monto),
      metodo_pago: data.metodo_pago as PagoMetodo,
      estado: data.estado as PagoEstado,
      referencia: (data.referencia as string | null) ?? null,
      notas: (data.notas as string | null) ?? null,
      created_by: (data.created_by as string | null) ?? null,
      created_at: String(data.created_at),
      updated_at: String(data.updated_at),
    },
  };
}

export async function deletePago(pagoId: string): Promise<PagoMutationResult> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pagos")
    .delete()
    .eq("id", pagoId)
    .select("reservation_id")
    .single()

  if (error || !data) {
    return { ok: false, error: "No se pudo eliminar el pago." }
  }

  revalidatePath("/dashboard/reservas")
  revalidatePath("/dashboard/pagos")

  return {
    ok: true,
    pago: {
      id: pagoId,
      reservation_id: String(data.reservation_id),
      monto: 0,
      metodo_pago: "Efectivo",
      estado: "pendiente",
      referencia: null,
      notas: null,
      created_by: null,
      created_at: "",
      updated_at: "",
    },
  }

  
}