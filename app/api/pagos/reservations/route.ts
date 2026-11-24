import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  // Defensa en profundidad (igual que services/reservations.ts): además de
  // RLS, limitamos a reservas de vehículos del propio admin.
  const { data: ownedVehicles } = await supabase
    .from("vehicles")
    .select("id")
    .eq("created_by", user.id)
  const ownedVehicleIds = (ownedVehicles ?? []).map((v) => String(v.id))
  if (ownedVehicleIds.length === 0) {
    return NextResponse.json({ reservations: [] })
  }

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, numero, client_name, total_price, vehicles:vehicle_id(brand, model)",
    )
    .in("vehicle_id", ownedVehicleIds)
    .neq("status", "cancelada")
    .neq("status", "finalizada")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ reservations: [] })
  }

  const reservations = (data ?? []).map((row) => {
    const rawVehicle = (row as { vehicles: unknown }).vehicles
    const vehicle = Array.isArray(rawVehicle)
      ? (rawVehicle[0] as { brand: string; model: string } | undefined)
      : (rawVehicle as { brand: string; model: string } | null)
    return {
      id: String((row as { id: string }).id),
      numero: String((row as { numero: string }).numero),
      client_name: String((row as { client_name: string }).client_name),
      total_price: Number((row as { total_price: number }).total_price),
      vehicle: {
        brand: String(vehicle?.brand ?? ""),
        model: String(vehicle?.model ?? ""),
      },
    }
  })

  return NextResponse.json({ reservations })
}