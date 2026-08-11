"use client";

import { useState } from "react";
import type { CLIENTE } from "@/services/clients";
import { ClientsStats } from "./EstadisticaCliente";
import { ClientsToolbar } from "./FiltrosClientes";
import { ClientsTable } from "./TablaCliente";

type Props = { clientes: CLIENTE[] };

export function ClientsPageClient({ clientes: clients }: Props) {

  const [buscar, setBuscar] = useState("") // para lo que el usuario busca
  const [tipo, setTipo] = useState("todos")  //para tipo osea si es registrado o invitado
  const [estado, setEstado] = useState("todos") //para el estado en el que esta el cliente
  const FiltradoClientes = clients.filter((cliente) => {
    const matchesSearch =
      cliente.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
      cliente.email.toLowerCase().includes(buscar.toLowerCase()) ||
      cliente.telefono.includes(buscar);

    const matchesTipo = tipo === "todos" || cliente.tipo === tipo;
    const matchesEstado = estado === "todos" || cliente.estado === estado;

    return matchesSearch && matchesTipo && matchesEstado;
  });


  
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Clientes</h1>

        <p className="text-muted-foreground">
          Clientes que han reservado tus vehiculos.
        </p>
      </div>

      <ClientsStats clients={clients} />

      <ClientsToolbar
        search={buscar}
        onSearchChange={setBuscar}
        tipo={tipo}
        onTipoChange={(value) => setTipo(value ?? "todos")}
        estado={estado}
        onEstadoChange={(value) => setEstado(value ?? "todos")}
      />

      <ClientsTable clients={FiltradoClientes} />
    </div>
  );
}
