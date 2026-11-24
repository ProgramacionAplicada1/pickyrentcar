"use server"

import {
  confirmPago as confirmPagoService,
  createPago as createPagoService,
  deletePago as deletePagoService,
  rejectPago as rejectPagoService,
  type CreatePagoInput,
  type PagoMutationResult,
} from "@/services/payments"

export async function createPago(
  input: CreatePagoInput,
): Promise<PagoMutationResult> {
  return createPagoService(input)
}

export async function confirmPago(pagoId: string): Promise<PagoMutationResult> {
  return confirmPagoService(pagoId)
}

export async function rejectPago(
  pagoId: string,
  motivo: string,
): Promise<PagoMutationResult> {
  return rejectPagoService(pagoId, motivo)
}

export async function deletePago(pagoId: string): Promise<PagoMutationResult> {
  return deletePagoService(pagoId)
}
