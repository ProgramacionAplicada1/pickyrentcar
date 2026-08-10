"use server"

import {
  createVehicle as createVehicleService,
  updateVehicle as updateVehicleService,
  deleteVehicle as deleteVehicleService,
  type VehicleActionResult,
  type VehicleFieldErrors,
} from "@/services/vehicles"

export type { VehicleActionResult, VehicleFieldErrors } from "@/services/vehicles"

export async function createVehicle(
  prev: VehicleActionResult | undefined,
  formData: FormData,
): Promise<VehicleActionResult> {
  return createVehicleService(prev, formData)
}

export async function updateVehicle(
  id: string,
  prev: VehicleActionResult | undefined,
  formData: FormData,
): Promise<VehicleActionResult> {
  return updateVehicleService(id, prev, formData)
}

export async function deleteVehicle(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  return deleteVehicleService(id)
}