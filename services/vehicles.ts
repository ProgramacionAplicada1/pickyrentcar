import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import {
  validateVehicleForm,
  type VehicleFieldErrors,
} from "@/app/dashboard/vehicles/validations"
import { MAX_VEHICLE_IMAGES } from "@/app/dashboard/vehicles/types"

// ============================================================================
// Types
// ============================================================================

export type VehicleRow = {
  id: string
  nombre: string | null
  plate: string
  brand: string
  model: string
  year: number
  color: string | null
  seats: number | null
  status: string
  transmission: string
  fuel_type: string
  category: string
  daily_price: number
  notes: string | null
  image_urls: string[]
  created_at: string
  updated_at?: string
}

export type VehicleFull = VehicleRow & {
  updated_at: string
}

export type VehicleStats = {
  total: number
  available: number
  inUse: number
  maintenance: number
}

export type VehicleActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: VehicleFieldErrors }

export type { VehicleFormData, VehicleFieldErrors } from "@/app/dashboard/vehicles/validations"

// ============================================================================
// Helpers
// ============================================================================

function translateVehicleError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes("duplicate key") || lower.includes("vehicles_plate_unique")) {
    return "Ya existe un vehículo con esa placa."
  }
  if (lower.includes("storage") || lower.includes("bucket")) {
    return "No se pudo subir la imagen. Verifica el archivo e inténtalo de nuevo."
  }
  return "No se pudo guardar el vehículo. Inténtalo de nuevo."
}

function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    const parts = url.pathname.split("/object/public/vehicles/")
    return parts[1] ?? null
  } catch {
    return null
  }
}

function readImageSlots(formData: FormData): {
  files: (File | null)[]
  existing: string[]
} {
  const files: (File | null)[] = []
  const existing: string[] = []

  for (let slot = 1; slot <= MAX_VEHICLE_IMAGES; slot++) {
    const fileEntry = formData.get(`image_file_${slot}`)
    const urlEntry = String(formData.get(`image_url_${slot}`) ?? "").trim()
    files.push(fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null)
    if (urlEntry) existing.push(urlEntry)
  }

  return { files, existing }
}

function collectFinalImageUrls(
  files: (File | null)[],
  existing: string[],
): { urls: string[]; removed: string[] } {
  const urls: string[] = []
  for (let slot = 0; slot < files.length; slot++) {
    if (files[slot]) continue
    if (existing[slot]) urls.push(existing[slot])
  }
  const removed = existing.filter((url) => !urls.includes(url))
  return { urls, removed }
}

async function removeStoragePaths(urls: string[]) {
  if (urls.length === 0) return
  const paths = urls
    .map(extractStoragePath)
    .filter((p): p is string => Boolean(p))
  if (paths.length === 0) return
  const supabase = await createClient()
  await supabase.storage.from("vehicles").remove(paths)
}

function normalizeImageUrls(row: {
  image_urls?: unknown
}): string[] {
  return Array.isArray(row.image_urls)
    ? (row.image_urls as string[])
    : []
}

// ============================================================================
// Queries
// ============================================================================

export async function listVehicles(): Promise<VehicleRow[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("vehicles")
    .select(
      "id, nombre, plate, brand, model, year, color, seats, status, transmission, fuel_type, category, daily_price, notes, image_urls, created_at",
    )
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  return (data ?? []).map((row) => ({
    ...(row as Omit<VehicleRow, "image_urls">),
    image_urls: normalizeImageUrls(row as { image_urls?: unknown }),
  }))
}

export async function getVehicleById(
  id: string,
): Promise<VehicleFull | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("vehicles")
    .select(
      "id, nombre, plate, brand, model, year, color, seats, status, transmission, fuel_type, category, daily_price, notes, image_urls, created_at, updated_at",
    )
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle()

  if (!data) return null
  return {
    ...(data as Omit<VehicleFull, "image_urls">),
    image_urls: normalizeImageUrls(data as { image_urls?: unknown }),
  }
}

export async function getVehicleStats(): Promise<VehicleStats> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { total: 0, available: 0, inUse: 0, maintenance: 0 }
  }

  const [total, available, inUse, maintenance] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("created_by", user.id),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("created_by", user.id)
      .eq("status", "available"),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("created_by", user.id)
      .eq("status", "in_use"),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("created_by", user.id)
      .eq("status", "maintenance"),
  ])

  return {
    total: total.count ?? 0,
    available: available.count ?? 0,
    inUse: inUse.count ?? 0,
    maintenance: maintenance.count ?? 0,
  }
}

// ============================================================================
// Mutations
// ============================================================================

export async function getMostRentedVehicles() {
  const vehicles = await listVehicles();
  const supabase = await createClient();

  const result = [];

  for (const vehicle of vehicles) {
    const { count } = await supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("vehicle_id", vehicle.id);

    result.push({
      nombre: vehicle.nombre ?? `${vehicle.brand} ${vehicle.model}`,
      reservas: count ?? 0,
    });
  }

  return result.sort((a, b) => b.reservas - a.reservas).slice(0, 5);
}



export async function createVehicle(
  _prev: VehicleActionResult | undefined,
  formData: FormData,
): Promise<VehicleActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Tu sesión ha expirado. Inicia sesión de nuevo." }
  }

  const validation = validateVehicleForm(formData)
  if (!validation.ok) {
    return {
      ok: false,
      error: "Revisa los campos resaltados.",
      fieldErrors: validation.errors,
    }
  }

  const { files, existing } = readImageSlots(formData)

  if (files.some((f) => f !== null)) {
    return {
      ok: false,
      error:
        "Las imágenes deben subirse desde el formulario antes de enviar. Recarga la página e inténtalo de nuevo.",
      fieldErrors: { images: "Subida pendiente. Recarga e inténtalo de nuevo." },
    }
  }

  const { urls: imageUrls } = collectFinalImageUrls(files, existing)

  const { error } = await supabase.from("vehicles").insert({
    created_by: user.id,
    nombre: validation.data.nombre,
    plate: validation.data.plate,
    brand: validation.data.brand,
    model: validation.data.model,
    year: validation.data.year,
    color: validation.data.color,
    seats: validation.data.seats,
    status: validation.data.status,
    transmission: validation.data.transmission,
    fuel_type: validation.data.fuel_type,
    category: validation.data.category,
    daily_price: validation.data.daily_price,
    notes: validation.data.notes,
    image_urls: imageUrls,
  })

  if (error) {
    await removeStoragePaths(imageUrls)
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Ya existe un vehículo con esa placa.",
        fieldErrors: { plate: "Esta placa ya está registrada." },
      }
    }
    return { ok: false, error: translateVehicleError(error.message) }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/vehicles")
  redirect("/dashboard/vehicles")
}

export async function updateVehicle(
  id: string,
  _prev: VehicleActionResult | undefined,
  formData: FormData,
): Promise<VehicleActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: "Tu sesión ha expirado. Inicia sesión de nuevo." }
  }

  const validation = validateVehicleForm(formData)
  if (!validation.ok) {
    return {
      ok: false,
      error: "Revisa los campos resaltados.",
      fieldErrors: validation.errors,
    }
  }

  const { data: existing } = await supabase
    .from("vehicles")
    .select("image_urls")
    .eq("id", id)
    .maybeSingle()

  if (!existing) {
    return { ok: false, error: "El vehículo no existe o fue eliminado." }
  }

  const previousUrls = Array.isArray(existing.image_urls)
    ? (existing.image_urls as string[])
    : []

  const { files, existing: formExisting } = readImageSlots(formData)

  if (files.some((f) => f !== null)) {
    return {
      ok: false,
      error:
        "Las imágenes deben subirse desde el formulario antes de enviar. Recarga la página e inténtalo de nuevo.",
      fieldErrors: { images: "Subida pendiente. Recarga e inténtalo de nuevo." },
    }
  }

  const { urls: imageUrls, removed } = collectFinalImageUrls(
    files,
    formExisting,
  )

  const { error } = await supabase
    .from("vehicles")
    .update({
      nombre: validation.data.nombre,
      plate: validation.data.plate,
      brand: validation.data.brand,
      model: validation.data.model,
      year: validation.data.year,
      color: validation.data.color,
      seats: validation.data.seats,
      status: validation.data.status,
      transmission: validation.data.transmission,
      fuel_type: validation.data.fuel_type,
      category: validation.data.category,
      daily_price: validation.data.daily_price,
      notes: validation.data.notes,
      image_urls: imageUrls,
    })
    .eq("id", id)

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "Ya existe un vehículo con esa placa.",
        fieldErrors: { plate: "Esta placa ya está registrada." },
      }
    }
    return { ok: false, error: translateVehicleError(error.message) }
  }

  const removedAll = [
    ...removed,
    ...previousUrls.filter((u) => !imageUrls.includes(u)),
  ]
  await removeStoragePaths(removedAll)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/vehicles")
  revalidatePath(`/dashboard/vehicles/${id}`)
  redirect(`/dashboard/vehicles/${id}`)
}

export async function deleteVehicle(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Tu sesión ha expirado." }

  const { data: veh } = await supabase
    .from("vehicles")
    .select("image_urls")
    .eq("id", id)
    .maybeSingle()

  const { error } = await supabase.from("vehicles").delete().eq("id", id)
  if (error) {
    return { ok: false, error: "No se pudo eliminar el vehículo." }
  }

  const urls = Array.isArray(veh?.image_urls)
    ? (veh!.image_urls as string[])
    : []
  await removeStoragePaths(urls)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/vehicles")
  return { ok: true }
}