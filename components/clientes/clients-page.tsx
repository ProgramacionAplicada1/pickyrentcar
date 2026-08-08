"use client";

import { useState } from "react";
import type { CLIENTE } from "@/services/clients";
import { ClientsStats } from "./EstadisticaCliente";
import { ClientsToolbar } from "./FiltrosClientes";
import { ClientsTable } from "./TablaCliente";

type Props = { clients: CLIENTE[] };

export function ClientsPage({ clients }: Props) {
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [estado, setEstado] = useState("todos");

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.nombre.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase()) ||
      client.telefono.includes(search);

    const matchesTipo = tipo === "todos" || client.tipo === tipo;
    const matchesEstado = estado === "todos" || client.estado === estado;

    return matchesSearch && matchesTipo && matchesEstado;
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Clientes</h1>

        <p className="text-muted-foreground">
          Gestiona los clientes que han reservado tus vehiculos.
        </p>
      </div>

      <ClientsStats clients={clients} />

      <ClientsToolbar
        search={search}
        onSearchChange={setSearch}
        tipo={tipo}
        onTipoChange={(value) => setTipo(value ?? "todos")}
        estado={estado}
        onEstadoChange={(value) => setEstado(value ?? "todos")}
      />

      <ClientsTable clients={filteredClients} />
    </div>
  );
}
