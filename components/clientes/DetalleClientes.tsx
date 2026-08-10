"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {ViewIcon, MoreHorizontalCircle01Icon, EyeIcon,} from "@hugeicons/core-free-icons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import { getClientDetailsAction } from "@/app/dashboard/clientes/actions";
import { CLIENTE } from "@/services/clients";
import ClientDetailModal, {type DetalleCliente} from "@/components/clientes/ClientDetailModal";

type Props = { clientId: string | null }

export function ClientsActions({ clientId }: Props) {
const [selectedClient, setSelectedClient] = useState<DetalleCliente | null>( null)
  const [detailOpen, setDetailOpen] = useState(false);

return (
  <>
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted">
        <HugeiconsIcon
          icon={MoreHorizontalCircle01Icon}
          strokeWidth={2}
          className="size-4"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={async () => {
            if (!clientId) return;

            const result = await getClientDetailsAction(clientId);
            console.log("RESULTADO CLIENTE:", result);

            if (!result) return;

            setSelectedClient({
              client: result.client,

              reservations: result.reservations.map((reservation) => ({
                id: reservation.id,
                numero: reservation.numero,
                start_date: reservation.start_date,
                end_date: reservation.end_date,
                total_price: Number(reservation.total_price),
                status: reservation.status,
                vehicle: Array.isArray(reservation.vehicle)
                  ? (reservation.vehicle[0] ?? null)
                  : reservation.vehicle,
              })),

              totalGastado: result.totalGastado,
            });

            setDetailOpen(true);
          }}
        >
          <HugeiconsIcon
            icon={ViewIcon}
            strokeWidth={2}
            className="mr-2 size-4"
          />
          Ver detalle
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <ClientDetailModal
      data={selectedClient}
      open={detailOpen}
      onClose={() => {
        setDetailOpen(false);
        setSelectedClient(null);
      }}
    />
  </>
);
}
