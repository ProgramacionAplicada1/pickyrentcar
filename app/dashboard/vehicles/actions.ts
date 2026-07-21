"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import {
  validateVehicleForm,
  type VehicleFieldErrors,
} from "./validations"

export type VehicleActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: VehicleFieldErrors }

export type { VehicleFormData, VehicleFieldErrors } from "./validations"

async function uploadVehicleImage(
  file: File,
  userId: string,
): Promise<string | null> {
  if (!file || file.size === 0) return null
  const supabase = await createClient()
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
  const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg"
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`

  const { error } = await supabase.storage
    .from("vehicles")
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) return null

  const { data } = supabase.storage.from("vehicles").getPublicUrl(path)
  return data.publicUrl
}

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

  const imageFile = formData.get("image_file")
  const file =
    imageFile instanceof File && imageFile.size > 0 ? imageFile : null

  let imageUrl = validation.data.image_url
  if (file) {
    const uploaded = await uploadVehicleImage(file, user.id)
    if (!uploaded) {
      return { ok: false, error: translateVehicleError("storage") }
    }
    imageUrl = uploaded
  }

  const { error } = await supabase.from("vehicles").insert({
    created_by: user.id,
    plate: validation.data.plate,
    brand: validation.data.brand,
    model: validation.data.model,
    year: validation.data.year,
    color: validation.data.color,
    seats: validation.data.seats,
    status: validation.data.status,
    notes: validation.data.notes,
    image_url: imageUrl,
  })

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
    .select("image_url")
    .eq("id", id)
    .maybeSingle()

  if (!existing) {
    return { ok: false, error: "El vehículo no existe o fue eliminado." }
  }

  const imageFile = formData.get("image_file")
  const file =
    imageFile instanceof File && imageFile.size > 0 ? imageFile : null

  let imageUrl = validation.data.image_url || existing.image_url
  if (file) {
    const uploaded = await uploadVehicleImage(file, user.id)
    if (!uploaded) {
      return { ok: false, error: translateVehicleError("storage") }
    }
    imageUrl = uploaded
  }

  const { error } = await supabase
    .from("vehicles")
    .update({
      plate: validation.data.plate,
      brand: validation.data.brand,
      model: validation.data.model,
      year: validation.data.year,
      color: validation.data.color,
      seats: validation.data.seats,
      status: validation.data.status,
      notes: validation.data.notes,
      image_url: imageUrl,
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

  if (file && existing.image_url && existing.image_url !== imageUrl) {
    const oldPath = extractStoragePath(existing.image_url)
    if (oldPath) {
      await supabase.storage.from("vehicles").remove([oldPath])
    }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/vehicles")
  revalidatePath(`/dashboard/vehicles/${id}`)
  redirect(`/dashboard/vehicles/${id}`)
}

export async function deleteVehicle(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Tu sesión ha expirado." }

  const { data: veh } = await supabase
    .from("vehicles")
    .select("image_url")
    .eq("id", id)
    .maybeSingle()

  const { error } = await supabase.from("vehicles").delete().eq("id", id)
  if (error) {
    return { ok: false, error: "No se pudo eliminar el vehículo." }
  }

  const path = veh?.image_url ? extractStoragePath(veh.image_url) : null
  if (path) {
    await supabase.storage.from("vehicles").remove([path])
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/vehicles")
  return { ok: true }
}
