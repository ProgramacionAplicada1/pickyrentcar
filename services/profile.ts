import { createClient } from "@/lib/supabase/server"

export type ClientProfile = {
  id: string
  fullName: string
  phone: string
  avatarUrl: string | null
  role: "admin" | "cliente"
  createdAt: string
  updatedAt: string | null
}

export async function getClientProfile(
  userId: string,
): Promise<ClientProfile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, avatar_url, role, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) return null

  if (data.role !== "cliente" && data.role !== "admin") return null

  return {
    id: data.id,
    fullName: data.full_name ?? "",
    phone: data.phone ?? "",
    avatarUrl: data.avatar_url ?? null,
    role: data.role,
    createdAt: data.created_at,
    updatedAt: data.updated_at ?? null,
  }
}
