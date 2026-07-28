import { redirect } from "next/navigation"

import { getCurrentUser } from "@/services/auth"

export default async function RootPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role === "admin") {
    redirect("/dashboard")
  }

  redirect("/catalogo")
}