"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;

  tipo: string;
  onTipoChange: (value: string | null) => void;

  estado: string;
  onEstadoChange: (value: string | null) => void;
};

export function ClientsToolbar({
  search,
  onSearchChange,
  tipo,
  onTipoChange,
  estado,
  onEstadoChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <HugeiconsIcon
          icon={Search01Icon}
          strokeWidth={2}
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />

        <Input
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-3">
        <Select value={tipo} onValueChange={onTipoChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="registrado">Registrados</SelectItem>
            <SelectItem value="invitado">Invitados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={estado} onValueChange={onEstadoChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendiente_pago">
              Pendiente
            </SelectItem>
            <SelectItem value="activo">
              Activo
            </SelectItem>
            <SelectItem value="finalizado">
              Finalizado
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}