"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { reportTransferPayment } from "@/app/(public)/mis-reservas/[id]/pagar/actions";

const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const ACCEPTED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

type Props = {
  reservationId: string;
  userId: string;
  /** true si ya existe un pago pendiente para esta reserva. */
  initiallyReported?: boolean;
};

/** Formulario para informar una transferencia (referencia + comprobante). */
export default function PaymentReportButton({
  reservationId,
  userId,
  initiallyReported = false,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [reported, setReported] = React.useState(initiallyReported);
  const [referencia, setReferencia] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [errors, setErrors] = React.useState<{
    referencia?: string;
    file?: string;
    form?: string;
  }>({});

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.currentTarget.files?.[0] ?? null;
    setErrors((prev) => ({ ...prev, file: undefined }));
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_PROOF_TYPES.includes(selected.type)) {
      setErrors((prev) => ({ ...prev, file: "Usa una imagen (JPG, PNG, WEBP) o un PDF." }));
      event.currentTarget.value = "";
      return;
    }
    if (selected.size > MAX_PROOF_BYTES) {
      setErrors((prev) => ({ ...prev, file: "El archivo no puede pesar más de 5 MB." }));
      event.currentTarget.value = "";
      return;
    }
    setFile(selected);
  }

  async function uploadProof(): Promise<string | null> {
    if (!file) return null;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${userId}/${reservationId}/${Date.now()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("comprobantes")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    return path;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const ref = referencia.trim();
    if (ref.length < 3) {
      setErrors({ referencia: "Escribe el número de referencia de la transferencia." });
      return;
    }

    setPending(true);
    setErrors({});

    try {
      let comprobantePath: string | null = null;
      try {
        comprobantePath = await uploadProof();
      } catch {
        setErrors({ file: "No se pudo subir el comprobante. Inténtalo de nuevo o envía sin él." });
        return;
      }

      const result = await reportTransferPayment(reservationId, {
        referencia: ref,
        comprobantePath,
      });

      if (!result.ok) {
        setErrors({ form: result.error });
        return;
      }

      setReported(true);
      toast.success(
        result.alreadyReported
          ? "Ya habías reportado un pago para esta reserva."
          : "Transferencia reportada. El propietario la verificará.",
      );
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (reported) {
    return (
      <Alert>
        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} />
        <AlertTitle>Pago en revisión</AlertTitle>
        <AlertDescription>
          El propietario verificará tu transferencia y confirmará la reserva.
          Te avisaremos en “Mis reservas”.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={errors.referencia ? true : undefined}>
          <FieldLabel htmlFor="transfer-reference">Número de referencia</FieldLabel>
          <Input
            id="transfer-reference"
            value={referencia}
            onChange={(event) => setReferencia(event.currentTarget.value)}
            placeholder="Ej. 000123456789"
            maxLength={60}
            disabled={pending}
            aria-invalid={errors.referencia ? true : undefined}
            required
          />
          {errors.referencia ? (
            <FieldError>{errors.referencia}</FieldError>
          ) : (
            <FieldDescription>
              Aparece en el comprobante de tu banco.
            </FieldDescription>
          )}
        </Field>

        <Field data-invalid={errors.file ? true : undefined}>
          <FieldLabel htmlFor="transfer-proof">Comprobante (opcional)</FieldLabel>
          <Input
            id="transfer-proof"
            type="file"
            accept={ACCEPTED_PROOF_TYPES.join(",")}
            onChange={handleFileChange}
            disabled={pending}
            aria-invalid={errors.file ? true : undefined}
          />
          {errors.file ? (
            <FieldError>{errors.file}</FieldError>
          ) : (
            <FieldDescription>Imagen o PDF, máximo 5 MB.</FieldDescription>
          )}
        </Field>

        {errors.form ? (
          <Alert variant="destructive">
            <AlertTitle>No se pudo registrar la transferencia</AlertTitle>
            <AlertDescription>{errors.form}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" className="w-full rounded-full" disabled={pending}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          {pending ? "Enviando..." : "Ya realicé la transferencia"}
        </Button>
      </FieldGroup>
    </form>
  );
}
