"use server"

import {
  createPublicReservation as createReservationService,
  type PublicReservationFieldErrors,
  type PublicReservationResult,
} from "@/services/catalog"

export type {
  PublicReservationFieldErrors,
  PublicReservationResult,
} from "@/services/catalog"

export async function createPublicReservation(
  _prev: PublicReservationResult | undefined,
  formData: FormData,
): Promise<PublicReservationResult> {
  return createReservationService(formData)
}