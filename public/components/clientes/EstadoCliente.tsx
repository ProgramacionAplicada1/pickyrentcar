import { Badge } from "@/components/ui/badge";
import { EstadoCliente } from "@/services/clients";

type Props = { status: EstadoCliente }

export function ClientsStatusBadge({ status }: Props) {
  switch (status) {
    case "activo":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 font-semibold">
          Reserva en curso
        </Badge>
      )
    

    case "finalizado":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-semibold">
          Finalizado
        </Badge>
      )
    

    default:
      return (
        <Badge
          variant="secondary"
          className="bg-amber-100 text-black-700 hover:bg-amber-100 font-semibold"
        >
          Pendiente de pago
        </Badge>
      )
  }
}
