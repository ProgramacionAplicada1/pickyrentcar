"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"

const ACCOUNT_TYPES = ["Ahorros", "Corriente"] as const

type BankDetails = {
  banco: string
  tipo_cuenta: string
  numero_cuenta: string
  titular_cuenta: string
}

const EMPTY: BankDetails = {
  banco: "",
  tipo_cuenta: "",
  numero_cuenta: "",
  titular_cuenta: "",
}

/**
 * Cuenta donde los clientes transfieren el pago de las reservas de los
 * vehículos de este dueño (se muestra en /mis-reservas/[id]/pagar/transferencia).
 */
export function BankDetailsForm() {
  const [values, setValues] = React.useState<BankDetails>(EMPTY)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("profiles")
        .select("banco, tipo_cuenta, numero_cuenta, titular_cuenta")
        .eq("id", user.id)
        .maybeSingle()
      if (cancelled) return
      setValues({
        banco: data?.banco ?? "",
        tipo_cuenta: data?.tipo_cuenta ?? "",
        numero_cuenta: data?.numero_cuenta ?? "",
        titular_cuenta: data?.titular_cuenta ?? "",
      })
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  function update(field: keyof BankDetails, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      toast.error("Tu sesión ha expirado. Inicia sesión de nuevo.")
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        banco: values.banco.trim() || null,
        tipo_cuenta: values.tipo_cuenta || null,
        numero_cuenta: values.numero_cuenta.trim() || null,
        titular_cuenta: values.titular_cuenta.trim() || null,
      })
      .eq("id", user.id)

    setSaving(false)

    if (error) {
      toast.error("No pudimos guardar los datos bancarios.", {
        description: error.message,
      })
      return
    }
    toast.success("Datos bancarios guardados.")
  }

  if (loading) {
    return (
      <div className="flex max-w-md flex-col gap-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="bank-name">Banco</FieldLabel>
          <Input
            id="bank-name"
            value={values.banco}
            onChange={(event) => update("banco", event.currentTarget.value)}
            placeholder="Ej. Banco Popular"
            maxLength={80}
            disabled={saving}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="bank-holder">Titular de la cuenta</FieldLabel>
          <Input
            id="bank-holder"
            value={values.titular_cuenta}
            onChange={(event) => update("titular_cuenta", event.currentTarget.value)}
            placeholder="Nombre o razón social"
            maxLength={120}
            disabled={saving}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="bank-account">Número de cuenta</FieldLabel>
          <Input
            id="bank-account"
            value={values.numero_cuenta}
            onChange={(event) => update("numero_cuenta", event.currentTarget.value)}
            inputMode="numeric"
            maxLength={40}
            disabled={saving}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="bank-type">Tipo de cuenta</FieldLabel>
          <Select
            value={values.tipo_cuenta || null}
            onValueChange={(value) => update("tipo_cuenta", String(value ?? ""))}
            disabled={saving}
          >
            <SelectTrigger id="bank-type" className="w-full">
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>
            Los clientes verán estos datos al pagar por transferencia.
          </FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner data-icon="inline-start" /> : null}
            {saving ? "Guardando..." : "Guardar datos bancarios"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
