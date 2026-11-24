import { HugeiconsIcon } from "@hugeicons/react";
import { MoneyBag01Icon } from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import {
  getComprobanteUrl,
  listPagos,
  type PagoEstado,
  type PagoMetodo,
  type PagoRowWithReservation,
} from "@/services/payments";

import { PaymentRowActions, type PagoListItem } from "./payment-modal";

export const metadata = { title: "Pagos · PickyRentCar" };

const ESTADO_LABEL: Record<PagoEstado, string> = {
  pendiente: "Pendiente",
  completado: "Completado",
  fallido: "Fallido",
  reembolsado: "Reembolsado",
};

const ESTADO_VARIANT: Record<
  PagoEstado,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pendiente: "outline",
  completado: "default",
  fallido: "destructive",
  reembolsado: "secondary",
};

function adaptToListItem(row: PagoRowWithReservation): PagoListItem {
  return {
    id: row.id,
    reservation_id: row.reservation_id,
    monto: row.monto,
    metodo_pago: row.metodo_pago as PagoMetodo,
    estado: row.estado as PagoEstado,
    numero: row.reservation?.numero ?? null,
    client_name: row.reservation?.client_name ?? null,
    vehicle_label: null,
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PagosPage() {
  const rows = await listPagos();
  // URLs firmadas (10 min) para ver comprobantes privados.
  const pagos: PagoConComprobante[] = await Promise.all(
    rows.map(async (pago) => ({
      ...pago,
      comprobante_url: await getComprobanteUrl(pago.comprobante_path),
    })),
  );
  const pendientes = pagos.filter((pago) => pago.estado === "pendiente");
  const completados = pagos.filter((pago) => pago.estado === "completado");
  const totalCobrado = completados.reduce((acc, pago) => acc + pago.monto, 0);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pagos</h1>
        <p className="text-sm text-muted-foreground">
          Confirma los pagos reportados por los clientes y consulta el
          historial de pagos recibidos.
        </p>
      </div>

      <Tabs defaultValue="pendientes">
        <TabsList>
          <TabsTrigger value="pendientes">
            Pendientes ({pendientes.length})
          </TabsTrigger>
          <TabsTrigger value="completados">
            Completados ({completados.length})
          </TabsTrigger>
          <TabsTrigger value="todos">Todos ({pagos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes">
          <PagosTable
            pagos={pendientes}
            emptyTitle="No hay pagos pendientes"
            emptyDescription="Cuando un cliente reporte un pago aparecerá aquí para que lo verifiques."
            showActions
          />
        </TabsContent>

        <TabsContent value="completados" className="flex flex-col gap-4">
          {completados.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Total cobrado:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(totalCobrado)}
              </span>
            </p>
          ) : null}
          <PagosTable
            pagos={completados}
            emptyTitle="Aún no hay pagos completados"
            emptyDescription="Los pagos que confirmes se guardarán en este historial."
          />
        </TabsContent>

        <TabsContent value="todos">
          <PagosTable
            pagos={pagos}
            emptyTitle="No hay pagos registrados"
            emptyDescription="Los pagos de tus reservas aparecerán aquí."
            showActions
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type PagoConComprobante = PagoRowWithReservation & {
  comprobante_url: string | null;
};

function PagosTable({
  pagos,
  emptyTitle,
  emptyDescription,
  showActions = false,
}: {
  pagos: PagoConComprobante[];
  emptyTitle: string;
  emptyDescription: string;
  showActions?: boolean;
}) {
  if (pagos.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={MoneyBag01Icon} strokeWidth={1.5} />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card className="py-0">
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-6">Reserva / Cliente</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              {showActions ? (
                <TableHead className="px-6 text-right">Acciones</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagos.map((pago) => {
              const item = adaptToListItem(pago);
              return (
                <TableRow key={pago.id}>
                  <TableCell className="px-6">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs tracking-wider text-muted-foreground">
                        {item.numero ?? "—"}
                      </span>
                      <span className="font-medium">
                        {item.client_name ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(pago.monto)}
                  </TableCell>
                  <TableCell>{pago.metodo_pago}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-xs">
                        {pago.referencia ?? "—"}
                      </span>
                      {pago.comprobante_url ? (
                        <a
                          href={pago.comprobante_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Ver comprobante
                        </a>
                      ) : null}
                      {pago.estado === "fallido" && pago.motivo_rechazo ? (
                        <span className="text-xs text-destructive">
                          {pago.motivo_rechazo}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ESTADO_VARIANT[pago.estado]}>
                      {ESTADO_LABEL[pago.estado]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(pago.created_at)}
                  </TableCell>
                  {showActions ? (
                    <TableCell className="px-6 text-right">
                      <PaymentRowActions pago={item} />
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
