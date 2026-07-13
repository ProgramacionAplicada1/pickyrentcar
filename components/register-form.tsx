"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon,
  Mail01Icon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase/client"
import { GoogleSignInButton } from "@/components/google-signin-button"

type FieldErrors = {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  terms?: string
  form?: string
}

function translateAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes("user already registered")) {
    return "Este correo electrónico ya está registrado."
  }
  if (lower.includes("password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres."
  }
  if (lower.includes("invalid email")) {
    return "El correo electrónico no es válido."
  }
  if (lower.includes("signup is currently disabled")) {
    return "El registro está deshabilitado temporalmente."
  }
  if (lower.includes("rate limit")) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo."
  }
  return "No se pudo crear la cuenta. Inténtalo de nuevo."
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export function RegisterForm() {
  const router = useRouter()

  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [acceptedTerms, setAcceptedTerms] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [errors, setErrors] = React.useState<FieldErrors>({})

  function validate(): FieldErrors {
    const next: FieldErrors = {}

    if (!fullName.trim()) {
      next.fullName = "Introduce tu nombre completo."
    } else if (fullName.trim().length < 2) {
      next.fullName = "El nombre debe tener al menos 2 caracteres."
    }

    if (!email.trim()) {
      next.email = "Introduce tu correo electrónico."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Introduce un correo electrónico válido."
    }

    if (!password) {
      next.password = "Introduce una contraseña."
    } else if (!PASSWORD_REGEX.test(password)) {
      next.password =
        "Mínimo 8 caracteres, con mayúscula, minúscula y un número."
    }

    if (!confirmPassword) {
      next.confirmPassword = "Confirma tu contraseña."
    } else if (confirmPassword !== password) {
      next.confirmPassword = "Las contraseñas no coinciden."
    }

    if (!acceptedTerms) {
      next.terms = "Debes aceptar los términos para continuar."
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

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    })

    if (error) {
      setErrors({ form: translateAuthError(error.message) })
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
        id="fullName"
        label="Nombre completo"
        error={errors.fullName}
        icon={<HugeiconsIcon icon={UserIcon} strokeWidth={1.5} />}
      >
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Ej. Juan Pérez"
          value={fullName}
          onChange={(e) => setFullName(e.currentTarget.value)}
          disabled={isPending}
          aria-invalid={!!errors.fullName}
          className="h-10 pl-11"
        />
      </Field>

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
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          disabled={isPending}
          aria-invalid={!!errors.password}
          className="h-10 pl-11 pr-11"
        />
      </Field>

      <Field
        id="confirmPassword"
        label="Confirmar contraseña"
        error={errors.confirmPassword}
        icon={<HugeiconsIcon icon={RefreshIcon} strokeWidth={1.5} />}
        rightAction={
          <PasswordToggle
            visible={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((v) => !v)}
            disabled={isPending}
          />
        }
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          disabled={isPending}
          aria-invalid={!!errors.confirmPassword}
          className="h-10 pl-11 pr-11"
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked)}
            disabled={isPending}
            className="mt-0.5"
          />
          <Label
            htmlFor="terms"
            className="text-sm leading-snug font-normal text-foreground/80"
          >
            <span className="whitespace-nowrap">Acepto los</span>{" "}
            <Link
              href="/terminos"
              className="whitespace-nowrap font-medium text-foreground underline-offset-4 hover:underline"
            >
              Términos de Servicio
            </Link>{" "}
            <span className="whitespace-nowrap">y la</span>{" "}
            <Link
              href="/privacidad"
              className="whitespace-nowrap font-medium text-foreground underline-offset-4 hover:underline"
            >
              Política de Privacidad
            </Link>
            .
          </Label>
        </div>
        {errors.terms && (
          <p className="ml-7 text-xs text-destructive">{errors.terms}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="h-10 w-full rounded-full"
      >
        {isPending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <Divider>O</Divider>

      <GoogleSignInButton />

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes una cuenta?{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
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
      <Label htmlFor={id} className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
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