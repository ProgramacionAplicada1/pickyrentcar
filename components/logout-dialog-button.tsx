"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"

export function LogoutDialogButton() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  async function handleLogout() {
    setIsPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsPending(false)
    setOpen(false)
    router.replace("/login")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Cerrar sesión"
        onClick={() => setOpen(true)}
        className="shrink-0 text-slate-400 hover:bg-slate-900 hover:text-red-400"
      >
        <HugeiconsIcon
          icon={Logout01Icon}
          strokeWidth={1.75}
          className="size-[18px]"
        />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar sesión</DialogTitle>
          <DialogDescription>
            ¿Seguro que deseas cerrar tu sesión? Tendrás que volver a iniciar
            sesión para acceder al sistema.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancelar
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isPending}
          >
            {isPending ? "Cerrando sesión…" : "Cerrar sesión"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
