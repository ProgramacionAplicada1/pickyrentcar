"use client"

import * as React from "react"
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export function ChangePasswordForm() {
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!PASSWORD_REGEX.test(password)) {
      setError("Usa al menos 8 caracteres, con mayúscula, minúscula y un número.")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setError("")
    setIsPending(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    setIsPending(false)

    if (updateError) {
      toast.error("No pudimos actualizar tu contraseña.", {
        description: updateError.message,
      })
      return
    }

    setPassword("")
    setConfirmPassword("")
    toast.success("Contraseña actualizada correctamente.")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordField
          id="new-password"
          label="Nueva contraseña"
          value={password}
          visible={showPassword}
          onVisibleChange={() => setShowPassword((value) => !value)}
          onChange={setPassword}
          disabled={isPending}
        />
        <PasswordField
          id="confirm-new-password"
          label="Confirmar contraseña"
          value={confirmPassword}
          visible={showConfirm}
          onVisibleChange={() => setShowConfirm((value) => !value)}
          onChange={setConfirmPassword}
          disabled={isPending}
        />
      </div>

      <p className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
        {error || "Mínimo 8 caracteres, incluyendo mayúscula, minúscula y un número."}
      </p>

      <div className="flex justify-end border-t pt-5">
        <Button
          type="submit"
          variant="outline"
          disabled={isPending || !password || !confirmPassword}
        >
          <FiLock />
          {isPending ? "Actualizando…" : "Cambiar contraseña"}
        </Button>
      </div>
    </form>
  )
}

function PasswordField({
  id,
  label,
  value,
  visible,
  onVisibleChange,
  onChange,
  disabled,
}: {
  id: string
  label: string
  value: string
  visible: boolean
  onVisibleChange: () => void
  onChange: (value: string) => void
  disabled: boolean
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <FiLock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          autoComplete="new-password"
          disabled={disabled}
          className="h-11 pl-10 pr-10"
        />
        <button
          type="button"
          onClick={onVisibleChange}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <FiEyeOff className="size-4" /> : <FiEye className="size-4" />}
        </button>
      </div>
    </div>
  )
}
