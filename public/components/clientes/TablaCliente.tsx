import { CLIENTE } from "@/services/clients";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ClientsStatusBadge } from "./EstadoCliente";
import { ClientsTypeBadge } from "./TipoCliente";
import { ClientsActions } from "./DetalleClientes";

type Props = { clients: CLIENTE[] }


export function ClientsTable({ clients }: Props) {


  return (
    <Table>
      <TableHeader className="border-y bg-zinc-50">
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Reservas</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Ultima reserva</TableHead>
          <TableHead className="w-[70px]" />
        </TableRow>
      </TableHeader>

      

      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id ?? client.email}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {client.nombre
                    .split(" ")
                    .slice(0, 2)
                    .map((word) => word[0])
                    .join("")}
                </div>

                <span className="font-medium">{client.nombre}</span>
              </div>
            </TableCell>

            <TableCell>
              <ClientsTypeBadge type={client.tipo} />
            </TableCell>

            <TableCell>
              <ClientsStatusBadge status={client.estado} />
            </TableCell>

            <TableCell>{client.reservas}</TableCell>

            <TableCell>RD${client.totalPagado.toLocaleString()}</TableCell>

            <TableCell>
              {new Intl.DateTimeFormat("es-DO", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "UTC",
              }).format(new Date(client.ultimaReserva))}
            </TableCell>

            <TableCell className="text-right">
              <ClientsActions clientId={client.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
