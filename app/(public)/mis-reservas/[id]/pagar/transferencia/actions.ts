"use server";

import { getCurrentUser } from "@/services/auth";
import { getMyReservationById } from "@/services/my-reservations";
import { createPago } from "@/services/payments";


export async function reportTransferPayment(reservationId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      ok: false,
      error: "Tu sesion ha expirado. Inicia sesion nuevamente.",
    }
  }



  if (user.role === "admin") {
    return {
      ok: false,
      error: "Esta accion no esta disponible para administradores.",
    }
  }



  const reservation = await getMyReservationById(reservationId);

  if (!reservation) {
    return {
      ok: false,
      error: "No se encontro la reserva.",
    }
  }



  if (reservation.status !== "pendiente_pago") {
    return {
      ok: false,
      error: "Esta reserva no esta pendiente de pago.",
    }
  }



  const result = await createPago({
    reservation_id: reservation.id,
    monto: reservation.total_price,
    metodo_pago: "Transferencia",
    estado: "pendiente",
  })
    
    console.log("RESULTADO DE CREAR PAGO:", result);


  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
  }
}
