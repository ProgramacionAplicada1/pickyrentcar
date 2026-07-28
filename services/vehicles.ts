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

async function uploadToSlot(
  file: File,
  userId: string,
  slot: number,
): Promise<string | null> {
  if (!file || file.size === 0) return null
  const supabase = await createClient()
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg"
  const path = `${userId}/slot${slot}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${safeExt}`

  const { error } = await supabase.storage
    .from("vehicles")
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) return null

  const { data } = supabase.storage.from("vehicles").getPublicUrl(path)
  return data.publicUrl
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

async function buildFinalImageUrls(
  files: (File | null)[],
  existing: string[],
  userId: string,
): Promise<{ urls: string[]; removed: string[]; storageError: boolean }> {
  const urls: string[] = []
  let storageError = false

  for (let slot = 0; slot < files.length; slot++) {
    const file = files[slot]
    if (file) {
      const uploaded = await uploadToSlot(file, userId, slot + 1)
      if (!uploaded) {
        storageError = true
        if (existing[slot]) urls.push(existing[slot])
      } else {
        urls.push(uploaded)
      }
    } else if (existing[slot]) {
      urls.push(existing[slot])
    }
  }

  const removed = existing.filter((url) => !urls.includes(url))
  return { urls, removed, storageError }
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
  const { data } = await supabase
    .from("vehicles")
    .select(
      "id, nombre, plate, brand, model, year, color, seats, status, transmission, fuel_type, category, daily_price, notes, image_urls, created_at",
    )
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
  const { data } = await supabase
    .from("vehicles")
    .select(
      "id, nombre, plate, brand, model, year, color, seats, status, transmission, fuel_type, category, daily_price, notes, image_urls, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle()

  if (!data) return null
  return {
    ...(data as Omit<VehicleFull, "image_urls">),
    image_urls: normalizeImageUrls(data as { image_urls?: unknown }),
  }
}

export async function getVehicleStats(): Promise<VehicleStats> {
  const supabase = await createClient()
  const [total, available, inUse, maintenance] = await Promise.all([
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("status", "available"),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_use"),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
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
  const { urls: imageUrls, storageError } = await buildFinalImageUrls(
    files,
    existing,
    user.id,
  )

  if (storageError) {
    return {
      ok: false,
      error: "No se pudieron subir algunas imágenes. Inténtalo de nuevo.",
      fieldErrors: { images: "Error al subir al menos una imagen." },
    }
  }

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

  const { urls: imageUrls, storageError, removed } = await buildFinalImageUrls(
    files,
    formExisting,
    user.id,
  )

  if (storageError) {
    return {
      ok: false,
      error: "No se pudieron subir algunas imágenes. Inténtalo de nuevo.",
      fieldErrors: { images: "Error al subir al menos una imagen." },
    }
  }

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