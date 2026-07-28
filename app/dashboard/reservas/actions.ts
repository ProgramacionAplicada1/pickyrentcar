"use server"

import {
  advanceReservationStatus as advanceService,
  cancelReservation as cancelService,
} from "@/services/reservations"

export async function advanceReservationStatus(
  reservationId: string,
): Promise<{ ok: boolean; error?: string }> {
  return advanceService(reservationId)
}

export async function cancelReservation(
  reservationId: string,
): Promise<{ ok: boolean; error?: string }> {
  return cancelService(reservationId)
}