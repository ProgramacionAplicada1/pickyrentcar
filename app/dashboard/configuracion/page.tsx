"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { BankDetailsForm } from "@/components/bank-details-form"
import { ChangePasswordForm } from "@/components/change-password-form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"

export default function ConfiguracionPage() {
  const router = useRouter()
  const [nombreAdmin, setNombreAdmin] = React.useState("")
  const [nameError, setNameError] = React.useState("")
  const [loadingPerfil, setLoadingPerfil] = React.useState(false)

  async function handleGuardarPerfil(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const fullName = nombreAdmin.trim()
    if (fullName.length < 2) {
      setNameError("Introduce un nombre válido de al menos 2 caracteres.")
      return
    }

    setNameError("")
    setLoadingPerfil(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoadingPerfil(false)
      toast.error("Tu sesión ha expirado. Inicia sesión de nuevo.")
      return
    }

    // getCurrentUser() lee el nombre desde profiles.full_name, así que es
    // ahí donde debe persistirse para que se vea en el panel.
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id)

    setLoadingPerfil(false)

    if (error) {
      toast.error("No pudimos actualizar tu nombre.", {
        description: error.message,
      })
      return
    }

    setNombreAdmin("")
    toast.success("Nombre actualizado correctamente.")
    router.refresh()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6 md:p-10">
      <div className="flex items-center gap-4">
        <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Configuración del Sistema
          </h1>
          <p className="text-sm text-muted-foreground">
            Administra tus credenciales de acceso a la plataforma.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil del Administrador</CardTitle>
          <CardDescription>
            Actualiza el nombre que se muestra en el panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGuardarPerfil} className="max-w-md">
            <FieldGroup>
              <Field data-invalid={nameError ? true : undefined}>
                <FieldLabel htmlFor="admin-name">
                  Nuevo nombre de usuario
                </FieldLabel>
                <Input
                  id="admin-name"
                  value={nombreAdmin}
                  onChange={(event) => setNombreAdmin(event.currentTarget.value)}
                  placeholder="Escribe tu nuevo nombre..."
                  disabled={loadingPerfil}
                  aria-invalid={nameError ? true : undefined}
                  required
                />
                {nameError ? (
                  <FieldDescription>{nameError}</FieldDescription>
                ) : null}
              </Field>
              <Field orientation="horizontal">
                <Button type="submit" disabled={loadingPerfil}>
                  {loadingPerfil ? <Spinner data-icon="inline-start" /> : null}
                  {loadingPerfil ? "Guardando..." : "Guardar cambios"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos bancarios</CardTitle>
          <CardDescription>
            Cuenta donde tus clientes transfieren el pago de sus reservas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BankDetailsForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguridad de la Cuenta</CardTitle>
          <CardDescription>
            Asegúrate de usar una contraseña larga y segura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
