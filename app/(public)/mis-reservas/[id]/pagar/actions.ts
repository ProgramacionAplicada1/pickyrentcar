"use server";

import { getCurrentUser } from "@/services/auth";
import { getMyReservationById } from "@/services/my-reservations";
import { createPago } from "@/services/payments";

export type ReportPaymentResult =
  | { ok: true; alreadyReported: boolean }
  | { ok: false; error: string };

type ReservationCheck =
  | { ok: true; reservationId: string; total: number; userId: string; alreadyReported: boolean }
  | { ok: false; error: string };

async function checkReservationPayable(
  reservationId: string,
): Promise<ReservationCheck> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Tu sesión ha expirado. Inicia sesión nuevamente." };
  }
  if (user.role === "admin") {
    return { ok: false, error: "Esta acción no está disponible para administradores." };
  }

  // getMyReservationById también vence reservas cuyo plazo pasó.
  const reservation = await getMyReservationById(reservationId);
  if (!reservation) {
    return { ok: false, error: "No se encontró la reserva." };
  }
  if (reservation.status === "cancelada") {
    return {
      ok: false,
      error: "El plazo para pagar esta reserva venció y fue cancelada.",
    };
  }
  if (reservation.status !== "pendiente_pago") {
    return { ok: false, error: "Esta reserva no está pendiente de pago." };
  }

  return {
    ok: true,
    reservationId: reservation.id,
    total: reservation.total_price,
    userId: user.id,
    // Evita registrar el mismo pago varias veces (doble clic, recargar…).
    alreadyReported: reservation.latest_payment?.estado === "pendiente",
  };
}

/** El cliente informa una transferencia con su número de referencia. */
export async function reportTransferPayment(
  reservationId: string,
  input: { referencia: string; comprobantePath: string | null },
): Promise<ReportPaymentResult> {
  const check = await checkReservationPayable(reservationId);
  if (!check.ok) return check;
  if (check.alreadyReported) return { ok: true, alreadyReported: true };

  const referencia = input.referencia.trim();
  if (referencia.length < 3 || referencia.length > 60) {
    return {
      ok: false,
      error: "Escribe el número de referencia de la transferencia (3 a 60 caracteres).",
    };
  }

  // El comprobante solo puede estar en la carpeta del propio cliente y reserva.
  const comprobantePath = input.comprobantePath?.trim() || null;
  if (
    comprobantePath &&
    !comprobantePath.startsWith(`${check.userId}/${check.reservationId}/`)
  ) {
    return { ok: false, error: "El comprobante adjunto no es válido." };
  }

  const result = await createPago({
    reservation_id: check.reservationId,
    monto: check.total,
    metodo_pago: "Transferencia",
    estado: "pendiente",
    referencia,
    comprobante_path: comprobantePath,
  });

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, alreadyReported: false };
}

/** El cliente elige pagar en efectivo al recoger el vehículo. */
export async function reportCashPayment(
  reservationId: string,
): Promise<ReportPaymentResult> {
  const check = await checkReservationPayable(reservationId);
  if (!check.ok) return check;
  if (check.alreadyReported) return { ok: true, alreadyReported: true };

  const result = await createPago({
    reservation_id: check.reservationId,
    monto: check.total,
    metodo_pago: "Efectivo",
    estado: "pendiente",
    notas: "Pago en efectivo al recoger el vehículo.",
  });

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, alreadyReported: false };
}
