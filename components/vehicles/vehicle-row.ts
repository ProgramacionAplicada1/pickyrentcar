import type { VehicleRow } from "@/services/vehicles"

export type { VehicleRow } from "@/services/vehicles"

export function getCoverUrl(
  vehicle: Pick<VehicleRow, "image_urls">,
): string | null {
  const urls = Array.isArray(vehicle.image_urls) ? vehicle.image_urls : []
  return urls[0] ?? null
}