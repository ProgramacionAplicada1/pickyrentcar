import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, DollarCircleIcon, Car01Icon,UserGroupIcon} from "@hugeicons/core-free-icons"
import { IncomeChart } from "./income-chart";
import { Card,CardContent,CardDescription,CardHeader, CardTitle} from "@/components/ui/card"
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getIncomeByMonth } from "@/services/payments"; 

export async function ReportesVista() {
  const stats = [
    {
      title: "Reservas",
      value: "0",
      note: "Reservas registradas",
      icon: Calendar01Icon,
    },
    {
      title: "Ingresos",
      value: "RD$ 0",
      note: "Total generado",
      icon: DollarCircleIcon,
    },
    {
      title: "Vehiculos",
      value: "0",
      note: "Vehículos registrados",
      icon: Car01Icon,
    },
    {
      title: "Clientes",
      value: "0",
      note: "Clientes registrados",
      icon: UserGroupIcon,
    },
  ];

  const ingresosPorMes = await getIncomeByMonth();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>

        <p className="text-muted-foreground">
          Consulta y analiza la informacion mas importante del sistema de
          alquiler de vehiculos.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="gap-3 rounded-2xl p-5">
              <CardContent className="flex flex-col gap-2 p-0">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>

                  <div className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HugeiconsIcon
                      icon={stat.icon}
                      strokeWidth={1.75}
                      className="size-4"
                    />
                  </div>
                </div>

                <p className="text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>

                <p className="text-xs text-muted-foreground">{stat.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Ingresos por mes</CardTitle>
            <CardDescription>
              Visualiza los ingresos generados durante el año.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-[350px]">
              <IncomeChart data={ingresosPorMes} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ReportesVista;
