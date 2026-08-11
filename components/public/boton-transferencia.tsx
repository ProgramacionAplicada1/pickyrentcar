"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { reportTransferPayment } from "@/app/(public)/mis-reservas/[id]/pagar/transferencia/actions";

type Props = {
  reservationId: string;
};

export default function PaymentReportButton({ reservationId }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleReportPayment() {
    setPending(true);
    setError(null);

    try {
      const result = await reportTransferPayment(reservationId);

     if (!result.ok) {
  setError(result.error ?? "No se pudo registrar la transferencia.");
  return;
}

      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="w-full rounded-full"
        disabled={pending}
        onClick={handleReportPayment}
      >
        {pending ? "Registrando..." : "Ya realicé la transferencia"}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
