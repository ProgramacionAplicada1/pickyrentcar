"use client";

import { useState } from "react";
import type { CLIENTE } from "@/services/clients";
import { ClientsStats } from "./EstadisticaCliente";
import { ClientsToolbar } from "./FiltrosClientes";
import { ClientsTable } from "./TablaCliente";

type Props = { clientes: CLIENTE[] };


const normalizarTexto = (texto?: string) => {
  if (!texto) return "";
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export function ClientsPageClient({ clientes: clients }: Props) {
  const [buscar, setBuscar] = useState(""); 
  const [tipo, setTipo] = useState("todos"); 
  const [estado, setEstado] = useState("todos");

  
  const busquedaNormalizada = normalizarTexto(buscar);

  const FiltradoClientes = clients.filter((cliente) => {
    
    const matchesTipo = tipo === "todos" || cliente.tipo === tipo;
    const matchesEstado = estado === "todos" || cliente.estado === estado;

    
    if (!matchesTipo || !matchesEstado) return false;

    
    if (!busquedaNormalizada) return true;

  
    const nombreNormalizado = normalizarTexto(cliente.nombre);
    const emailNormalizado = normalizarTexto(cliente.email);
    const telefono = cliente.telefono || ""; 

    return (
      nombreNormalizado.includes(busquedaNormalizada) ||
      emailNormalizado.includes(busquedaNormalizada) ||
      telefono.includes(busquedaNormalizada)
    );
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