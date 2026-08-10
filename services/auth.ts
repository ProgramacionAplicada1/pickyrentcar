import { cache } from "react"

import { createClient } from "@/lib/supabase/server"

export type AuthRole = "admin" | "cliente"

export type AuthUser = {
  id: string
  email: string
  role: AuthRole
  displayName: string
}

export const getCurrentUser = cache(async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle()

  const meta = (user.user_metadata as Record<string, string | undefined>) ?? {}
const profileRole = (profile as { role?: string } | null)?.role;
if (profileRole !== "admin" && profileRole !== "cliente") {
  return null;
}
const role: AuthRole = profileRole;
  
  
  const displayName =
    (profile as { full_name?: string } | null)?.full_name ??
    meta.full_name ??
    meta.name ??
    meta.nombre ??
    user.email?.split("@")[0] ??
    "Usuario"

  return {
    id: user.id,
    email: user.email ?? "",
    role,
    displayName,
  }
})
