"use client";

import { Bar, BarChart,CartesianGrid,ResponsiveContainer, Tooltip, XAxis,YAxis} from "recharts";

type Vehiculos = {
  data: {
    nombre: string,
    reservas: number
  }[]}

export function VehiculosMasRentados({ data }: Vehiculos) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="nombre" width={120} />
        <Tooltip />
        <Bar dataKey="reservas" fill="#2563eb" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
