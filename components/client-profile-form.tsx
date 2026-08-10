"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { FiPhone, FiSave, FiUser } from "react-icons/fi"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

type Props = {
  userId: string
  initialFullName: string
  initialPhone: string
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+()\-\s]/g, "").slice(0, 24)
}

export function ClientProfileForm({
  userId,
  initialFullName,
  initialPhone,
}: Props) {
  const router = useRouter()
  const [fullName, setFullName] = React.useState(initialFullName)
  const [phone, setPhone] = React.useState(initialPhone)
  const [isPending, setIsPending] = React.useState(false)
  const [nameError, setNameError] = React.useState("")

  const hasChanges =
    fullName.trim() !== initialFullName.trim() || phone.trim() !== initialPhone.trim()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (fullName.trim().length < 2) {
      setNameError("Introduce un nombre válido de al menos 2 caracteres.")
      return
    }

    setNameError("")
    setIsPending(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      })
      .eq("id", userId)

    setIsPending(false)

    if (error) {
      toast.error("No pudimos guardar tus cambios.", {
        description: error.message,
      })
      return
    }

    toast.success("Perfil actualizado", {
      description: "Tus datos personales se guardaron correctamente.",
    })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="profile-full-name">Nombre completo</Label>
          <div className="relative">
            <FiUser className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="profile-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.currentTarget.value)}
              autoComplete="name"
              disabled={isPending}
              className="h-11 pl-10"
              aria-invalid={Boolean(nameError)}
            />
          </div>
          {nameError && <p className="text-xs text-destructive">{nameError}</p>}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="profile-phone">Teléfono</Label>
          <div className="relative">
            <FiPhone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="profile-phone"
              value={phone}
              onChange={(event) => setPhone(normalizePhone(event.currentTarget.value))}
              autoComplete="tel"
              inputMode="tel"
              placeholder="Ej. (809) 555-0123"
              disabled={isPending}
              className="h-11 pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Lo utilizaremos como dato de contacto para tus reservas.
          </p>
        </div>
      </div>

      <div className="flex justify-end border-t pt-5">
        <Button type="submit" disabled={isPending || !hasChanges}>
          <FiSave />
          {isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}
