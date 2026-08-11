"use server"

import {
  createPago as createPagoService,
  updatePagoEstado as updatePagoEstadoService,
  deletePago as deletePagoService,
  type CreatePagoInput,
  type PagoMutationResult,
  type PagoEstado,
} from "@/services/payments"

export async function createPago(
  input: CreatePagoInput,
): Promise<PagoMutationResult> {
  return createPagoService(input)
}

export async function updatePagoEstado(
  pagoId: string,
  estado: PagoEstado,
): Promise<PagoMutationResult> {
  return updatePagoEstadoService(pagoId, estado)
}

export async function deletePago(
  pagoId: string,
): Promise<PagoMutationResult> {
  return deletePagoService(pagoId)
}