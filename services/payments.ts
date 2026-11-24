import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import {
  confirmReservationAfterPayment,
  reopenPaymentWindow,
} from "@/services/reservations"

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

/** Bucket privado de comprobantes (migración 022). */
export const COMPROBANTES_BUCKET = "comprobantes"

export type PagoRow = {
  id: string
  reservation_id: string
  monto: number
  metodo_pago: PagoMetodo
  estado: PagoEstado
  referencia: string | null
  notas: string | null
  comprobante_path: string | null
  motivo_rechazo: string | null
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
  comprobante_path?: string | null
}

export type PagoMutationResult =
  | { ok: true; pago: PagoRow }
  | { ok: false; error: string }

export type PaymentDetails = {
  banco: string | null
  tipo_cuenta: string | null
  numero_cuenta: string | null
  titular_cuenta: string | null
}

const PAGO_COLUMNS =
  "id, reservation_id, monto, metodo_pago, estado, referencia, notas, comprobante_path, motivo_rechazo, created_by, created_at, updated_at"

function mapPago(row: Record<string, unknown>): PagoRow {
  return {
    id: String(row.id),
    reservation_id: String(row.reservation_id),
    monto: Number(row.monto),
    metodo_pago: row.metodo_pago as PagoMetodo,
    estado: row.estado as PagoEstado,
    referencia: (row.referencia as string | null) ?? null,
    notas: (row.notas as string | null) ?? null,
    comprobante_path: (row.comprobante_path as string | null) ?? null,
    motivo_rechazo: (row.motivo_rechazo as string | null) ?? null,
    created_by: (row.created_by as string | null) ?? null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

function revalidatePaymentPaths(reservationId?: string) {
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/reservas")
  revalidatePath("/dashboard/pagos")
  revalidatePath("/dashboard/clientes")
  revalidatePath("/mis-reservas")
  if (reservationId) {
    revalidatePath(`/dashboard/reservas/${reservationId}`)
    revalidatePath(`/mis-reservas/${reservationId}`)
  }
}

// ============================================================================
// Queries
// ============================================================================

export async function listPagos(): Promise<PagoRowWithReservation[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pagos")
    .select(
      `${PAGO_COLUMNS}, reservations:reservation_id(numero, client_name, total_price, status)`,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[payments] No se pudieron listar los pagos:", error.message)
    return []
  }

  return (data ?? []).map((row) => {
    const rawReservation = (row as { reservations: unknown }).reservations
    const reservation = Array.isArray(rawReservation)
      ? (rawReservation[0] as PagoRowWithReservation["reservation"] | undefined)
      : (rawReservation as PagoRowWithReservation["reservation"] | null)

    return {
      ...mapPago(row as Record<string, unknown>),
      reservation: reservation ?? null,
    } satisfies PagoRowWithReservation
  })
}

export async function listPagosByReservation(
  reservationId: string,
): Promise<PagoRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("pagos")
    .select(PAGO_COLUMNS)
    .eq("reservation_id", reservationId)
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => mapPago(row as Record<string, unknown>))
}

export async function getPagoById(id: string): Promise<PagoRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("pagos")
    .select(PAGO_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  return data ? mapPago(data as Record<string, unknown>) : null
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

/** Datos bancarios del dueño del vehículo de la reserva (RPC 022). */
export async function getPaymentDetails(
  reservationId: string,
): Promise<PaymentDetails | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_payment_details", {
    p_reservation_id: reservationId,
  })
  if (error || !Array.isArray(data) || data.length === 0) return null
  return data[0] as PaymentDetails
}

/** URL temporal (10 min) para ver un comprobante privado. */
export async function getComprobanteUrl(
  path: string | null,
): Promise<string | null> {
  if (!path) return null
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from(COMPROBANTES_BUCKET)
    .createSignedUrl(path, 600)
  if (error) return null
  return data.signedUrl
}

export async function getIncomeByMonth(
  year: number = new Date().getFullYear(),
) {
  const pagos = await listPagos()

  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ]

  const ingresos = Array.from({ length: 12 }, (_, index) => ({
    mes: meses[index],
    ingresos: 0,
  }))

  pagos.forEach((pago) => {
    if (pago.estado !== "completado") return
    const fecha = new Date(pago.created_at)
    if (fecha.getFullYear() !== year) return
    ingresos[fecha.getMonth()].ingresos += pago.monto
  })

  return ingresos
}

// ============================================================================
// Mutations
// ============================================================================

export async function createPago(
  input: CreatePagoInput,
): Promise<PagoMutationResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "Tu sesión ha expirado. Inicia sesión de nuevo." }
  }
  if (!input.reservation_id) {
    return { ok: false, error: "Selecciona una reserva." }
  }
  if (!Number.isFinite(input.monto) || input.monto <= 0) {
    return { ok: false, error: "El monto debe ser mayor que 0." }
  }
  if (!PAGO_METODOS.includes(input.metodo_pago)) {
    return { ok: false, error: "Método de pago inválido." }
  }

  const estado: PagoEstado = input.estado ?? "pendiente"

  const { data: ownsReservation, error: ownsError } = await supabase.rpc(
    "user_owns_reservation",
    { p_reservation_id: input.reservation_id },
  )

  if (ownsError) {
    return { ok: false, error: "No se pudo verificar la reserva." }
  }
  if (!ownsReservation) {
    return { ok: false, error: "No tienes permiso para registrar este pago." }
  }

  const { data, error } = await supabase
    .from("pagos")
    .insert({
      reservation_id: input.reservation_id,
      monto: input.monto,
      metodo_pago: input.metodo_pago,
      estado,
      referencia: input.referencia ?? null,
      notas: input.notas ?? null,
      comprobante_path: input.comprobante_path ?? null,
      created_by: user.id,
    })
    .select(PAGO_COLUMNS)
    .single()

  if (error || !data) {
    console.error("[payments] Error al crear el pago:", error?.message)
    return { ok: false, error: "El pago no pudo ser creado. Inténtalo de nuevo." }
  }

  revalidatePaymentPaths(input.reservation_id)
  return { ok: true, pago: mapPago(data as Record<string, unknown>) }
}

/**
 * El admin confirma que recibió el pago:
 * reserva pendiente_pago → confirmada (revisando que las fechas sigan libres)
 * y pago → completado.
 */
export async function confirmPago(pagoId: string): Promise<PagoMutationResult> {
  const supabase = await createClient()

  const pago = await getPagoById(pagoId)
  if (!pago) return { ok: false, error: "El pago no existe." }
  if (pago.estado !== "pendiente") {
    return { ok: false, error: "Este pago ya fue revisado." }
  }

  const { data: reservation } = await supabase
    .from("reservations")
    .select("status")
    .eq("id", pago.reservation_id)
    .maybeSingle()

  if (!reservation) return { ok: false, error: "La reserva no existe." }
  if (reservation.status !== "pendiente_pago") {
    return {
      ok: false,
      error: "La reserva ya no está por pagar (puede haber sido cancelada).",
    }
  }

  const confirmed = await confirmReservationAfterPayment(pago.reservation_id)
  if (!confirmed.ok) {
    return { ok: false, error: confirmed.error ?? "No se pudo confirmar la reserva." }
  }

  const { data, error } = await supabase
    .from("pagos")
    .update({ estado: "completado", motivo_rechazo: null })
    .eq("id", pagoId)
    .select(PAGO_COLUMNS)
    .single()

  if (error || !data) {
    // Revertimos la reserva para no dejarla confirmada sin pago.
    await supabase
      .from("reservations")
      .update({ status: "pendiente_pago" })
      .eq("id", pago.reservation_id)
    return { ok: false, error: "No se pudo actualizar el estado del pago." }
  }

  revalidatePaymentPaths(pago.reservation_id)
  return { ok: true, pago: mapPago(data as Record<string, unknown>) }
}

/**
 * El admin rechaza el pago (no llegó, referencia incorrecta…). El cliente ve
 * el motivo y recibe un plazo nuevo para volver a pagar.
 */
export async function rejectPago(
  pagoId: string,
  motivo: string,
): Promise<PagoMutationResult> {
  const reason = motivo.trim()
  if (reason.length < 3) {
    return { ok: false, error: "Indica el motivo del rechazo." }
  }

  const pago = await getPagoById(pagoId)
  if (!pago) return { ok: false, error: "El pago no existe." }
  if (pago.estado !== "pendiente") {
    return { ok: false, error: "Este pago ya fue revisado." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pagos")
    .update({ estado: "fallido", motivo_rechazo: reason.slice(0, 500) })
    .eq("id", pagoId)
    .select(PAGO_COLUMNS)
    .single()

  if (error || !data) {
    return { ok: false, error: "No se pudo rechazar el pago." }
  }

  await reopenPaymentWindow(pago.reservation_id)

  revalidatePaymentPaths(pago.reservation_id)
  return { ok: true, pago: mapPago(data as Record<string, unknown>) }
}

/** Compatibilidad: completado → confirmPago, fallido → rejectPago. */
export async function updatePagoEstado(
  pagoId: string,
  estado: PagoEstado,
): Promise<PagoMutationResult> {
  if (estado === "completado") return confirmPago(pagoId)
  if (estado === "fallido") return rejectPago(pagoId, "Pago rechazado por el administrador.")
  return { ok: false, error: "Estado de pago no soportado." }
}

export async function deletePago(pagoId: string): Promise<PagoMutationResult> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("pagos")
    .delete()
    .eq("id", pagoId)
    .select(PAGO_COLUMNS)
    .single()

  if (error || !data) {
    return { ok: false, error: "No se pudo eliminar el pago." }
  }

  const pago = mapPago(data as Record<string, unknown>)
  revalidatePaymentPaths(pago.reservation_id)
  return { ok: true, pago }
}
