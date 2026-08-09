import { Badge } from "@/components/ui/badge";
import { TipoCliente } from "@/services/clients";

type Props = { type: TipoCliente }

export function ClientsTypeBadge({ type }: Props) {
  switch (type) {
    case "registrado":
      return (
        <Badge
          variant="secondary"
          className="rounded-full bg-emerald-100 text-emerald-700 font-semibold"
        >
          Registrado
        </Badge>
      )
    
    

    case "invitado":
      return (
        <Badge
          variant="secondary"
          className="rounded-full bg-slate-100 text-slate-700 font-semibold"
        >
          Invitado
        </Badge>
      )
  }
}
