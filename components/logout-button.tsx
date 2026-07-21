"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function LogoutButton() {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  async function handleLogout() {
    setIsPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="rounded-full"
    >
      <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.75} />
      {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
    </Button>
  )
}
