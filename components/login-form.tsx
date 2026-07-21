"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { GoogleSignInButton } from "@/components/google-signin-button"

type FieldErrors = {
  email?: string
  password?: string
  form?: string
}

function translateSignInError(message: string): string {
  const lower = message.toLowerCase()
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password") ||
    lower.includes("invalid credentials")
  ) {
    return "Correo o contraseña incorrectos."
  }
  if (lower.includes("email not confirmed")) {
    return "Confirma tu correo antes de iniciar sesión."
  }
  if (lower.includes("user not found")) {
    return "Correo o contraseña incorrectos."
  }
  if (lower.includes("rate limit")) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo."
  }
  return "No se pudo iniciar sesión. Inténtalo de nuevo."
}

export function LoginForm() {
  const router = useRouter()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [errors, setErrors] = React.useState<FieldErrors>({})

  function validate(): FieldErrors {
    const next: FieldErrors = {}

    if (!email.trim()) {
      next.email = "Introduce tu correo electrónico."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Introduce un correo electrónico válido."
    }

    if (!password) {
      next.password = "Introduce tu contraseña."
    }

    return next
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validate()
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    setIsPending(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      setErrors({ form: translateSignInError(error.message) })
      setIsPending(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col gap-3"
    >
      {errors.form && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          <HugeiconsIcon
            icon={AlertCircleIcon}
            strokeWidth={2}
            className="mt-0.5 size-4 shrink-0"
          />
          <span>{errors.form}</span>
        </div>
      )}

      <Field
        id="email"
        label="Correo electrónico"
        error={errors.email}
        icon={<HugeiconsIcon icon={Mail01Icon} strokeWidth={1.5} />}
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nombre@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          disabled={isPending}
          aria-invalid={!!errors.email}
          className="h-10 pl-11"
        />
      </Field>

      <Field
        id="password"
        label="Contraseña"
        error={errors.password}
        icon={<HugeiconsIcon icon={LockIcon} strokeWidth={1.5} />}
        rightAction={
          <PasswordToggle
            visible={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            disabled={isPending}
          />
        }
      >
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          disabled={isPending}
          aria-invalid={!!errors.password}
          className="h-10 pl-11 pr-11"
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="h-10 w-full rounded-full"
      >
        {isPending ? "Iniciando sesión…" : "Iniciar sesión"}
      </Button>

      <Divider>O</Divider>

      <GoogleSignInButton mode="signin" />

      <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
        <Link
          href="/forgot-password"
          className="hover:text-foreground hover:underline"
        >
          Recuperar contraseña
        </Link>
        <p>
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  error,
  icon,
  rightAction,
  children,
}: {
  id: string
  label: string
  error?: string
  icon: React.ReactNode
  rightAction?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label
        htmlFor={id}
        className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase"
      >
        {label}
      </Label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground [&_svg]:size-[18px]">
          {icon}
        </div>
        {children}
        {rightAction && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {rightAction}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function PasswordToggle({
  visible,
  onToggle,
  disabled,
}: {
  visible: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      <HugeiconsIcon
        icon={visible ? EyeOffIcon : EyeIcon}
        strokeWidth={1.5}
        className="size-[18px]"
      />
    </button>
  )
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        {children}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
