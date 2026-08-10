"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

type Props = {
  className?: string
  redirectTo?: string
}

export function PublicLogoutButton({ className, redirectTo = "/" }: Props) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  async function handleLogout() {
    setIsPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsPending(false)
    router.replace(redirectTo)
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className ?? "rounded-full"}
      onClick={handleLogout}
      disabled={isPending}
    >
      <HugeiconsIcon
        icon={Logout01Icon}
        strokeWidth={1.75}
      />
      {isPending ? "Cerrando…" : "Cerrar sesión"}
    </Button>
  );
}