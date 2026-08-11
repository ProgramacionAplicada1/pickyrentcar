import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

type CleanupPayload = {
  paths?: unknown
}

const MAX_PATHS_PER_REQUEST = 20
const MAX_PATH_LENGTH = 256

function sanitizePath(input: unknown): string | null {
  if (typeof input !== "string") return null
  const trimmed = input.trim()
  if (trimmed.length === 0 || trimmed.length > MAX_PATH_LENGTH) return null
  if (trimmed.includes("..") || trimmed.startsWith("/")) return null
  if (!/^[a-zA-Z0-9._/-]+$/.test(trimmed)) return null
  return trimmed
}

export async function POST(request: Request) {
  let body: CleanupPayload
  try {
    body = (await request.json()) as CleanupPayload
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const rawPaths = Array.isArray(body.paths) ? body.paths : []
  if (rawPaths.length === 0) {
    return NextResponse.json({ ok: true, removed: 0 })
  }
  if (rawPaths.length > MAX_PATHS_PER_REQUEST) {
    return NextResponse.json(
      { ok: false, error: "too_many_paths" },
      { status: 400 },
    )
  }

  const paths = rawPaths
    .map((p) => sanitizePath(p))
    .filter((p): p is string => Boolean(p))
  if (paths.length === 0) {
    return NextResponse.json({ ok: true, removed: 0 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const ownedPaths = paths.filter((p) => p.startsWith(`${user.id}/`))
  if (ownedPaths.length === 0) {
    return NextResponse.json({ ok: true, removed: 0 })
  }

  const { error } = await supabase.storage
    .from("vehicles")
    .remove(ownedPaths)

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, removed: ownedPaths.length })
}