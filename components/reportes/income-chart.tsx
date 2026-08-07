"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Graficos = {
  data: {
    mes: string;
    ingresos: number;
  }[];
};

export function IncomeChart({ data }: Graficos) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis tickFormatter={(value) => `RD$ ${value / 1000}k`}/>
        <Tooltip formatter={(value) => [ `RD$ ${Number(value).toLocaleString()}`,"Ingresos",]}/>
        <Bar dataKey="ingresos" fill="#003366" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
