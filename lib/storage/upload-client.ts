"use client"

import { createClient } from "@/lib/supabase/client"

export type UploadResult = {
  publicUrl: string
  path: string
}

export type UploadError = {
  code: "auth" | "network" | "http" | "unknown"
  message: string
  status?: number
}

export async function uploadVehicleImage(
  file: File,
  slot: number,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw {
      code: "auth",
      message: "Tu sesión ha expirado. Inicia sesión de nuevo.",
    } satisfies UploadError
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) {
    throw {
      code: "auth",
      message: "No se pudo obtener el token de sesión.",
    } satisfies UploadError
  }

  const extRaw = file.name.split(".").pop() || "jpg"
  const safeExt = /^[a-z0-9]+$/i.test(extRaw) ? extRaw.toLowerCase() : "jpg"
  const path = `${user.id}/slot${slot}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${safeExt}`

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const url = `${supabaseUrl}/storage/v1/object/vehicles/${path}`

  const result = await xhrUpload({
    url,
    token,
    file,
    contentType: file.type || "image/jpeg",
    onProgress,
  })

  if (!result.ok) {
    throw {
      code: result.status ? "http" : "network",
      message:
        result.status && result.status >= 400
          ? `Error ${result.status} al subir la imagen.`
          : "No se pudo subir la imagen. Verifica tu conexión.",
      status: result.status,
    } satisfies UploadError
  }

  const { data } = supabase.storage.from("vehicles").getPublicUrl(path)

  return {
    publicUrl: data.publicUrl,
    path,
  }
}

function xhrUpload({
  url,
  token,
  file,
  contentType,
  onProgress,
}: {
  url: string
  token: string
  file: File
  contentType: string
  onProgress?: (percent: number) => void
}): Promise<{ ok: boolean; status?: number }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", url)
    xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    xhr.setRequestHeader("Content-Type", contentType)
    xhr.setRequestHeader("x-upsert", "false")

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ ok: true, status: xhr.status })
      } else {
        resolve({ ok: false, status: xhr.status })
      }
    }
    xhr.onerror = () => resolve({ ok: false })
    xhr.onabort = () => resolve({ ok: false })

    try {
      xhr.send(file)
    } catch {
      resolve({ ok: false })
    }
  })
}

export function extractPathFromPublicUrl(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    const parts = url.pathname.split("/object/public/vehicles/")
    return parts[1] ?? null
  } catch {
    return null
  }
}