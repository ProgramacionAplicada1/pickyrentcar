import { createClient } from "@/lib/supabase/server"

export async function getFavoriteVehicleIds(): Promise<string[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("favorites")
    .select("vehicle_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    // Compatibilidad mientras se aplica la migración 013.
    console.error("[favorites] No se pudieron cargar los favoritos:", error.message)
    return []
  }

  return (data ?? [])
    .map((item) => String(item.vehicle_id ?? ""))
    .filter(Boolean)
}
