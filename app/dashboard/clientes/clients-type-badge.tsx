import { Badge } from "@/components/ui/badge";
import { ClientType } from "@/services/clients";

type Props = {
  type: ClientType;
};

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
            );

        case "invitado":
            return (
                <Badge
                    variant="secondary"
                    className="rounded-full bg-slate-100 text-slate-700 font-semibold"
                >
                    Invitado
                </Badge>
            );
    }
}
