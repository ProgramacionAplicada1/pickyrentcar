import { HugeiconsIcon } from "@hugeicons/react";
import {Calendar01Icon, DollarCircleIcon, Car01Icon,UserGroupIcon,} from "@hugeicons/core-free-icons";
import { GraficoIngresos } from "./grafico-ingresos";
import { Card, CardContent,CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import { getIncomeByMonth } from "@/services/payments";
import { getClientsByOwner } from "@/services/clients";
import { getReservationStats } from "@/services/reservations";
import { getVehicleStats } from "@/services/vehicles";
import { getMostRentedVehicles } from "@/services/vehicles";
import { VehiculosMasRentados } from "./vehiculos-mas-rentados";

export async function ReportesVista() {
  const ingresosPorMes = await getIncomeByMonth()
  const clientes = await getClientsByOwner()
  const reservaciones = await getReservationStats()
  const vehiculos = await getVehicleStats()
  const vehiculosMasAlquilados = await getMostRentedVehicles()

  const cartas = [
    {
      title: "Total reservas",
      value: String(reservaciones.total),
      note: "Reservas registradas",
      icon: Calendar01Icon,
    },
    {
      title: "Ingresos",
      value: `RD$ ${reservaciones.facturado.toLocaleString()}`,
      note: "Total generado",
      icon: DollarCircleIcon,
    },
    {
      title: "Vehiculos",
      value: String(vehiculos.total),
      note: "Vehiculos registrados",
      icon: Car01Icon,
    },
    {
      title: "Clientes",
      value: String(clientes.length),
      note: "Clientes registrados",
      icon: UserGroupIcon,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>

        <p className="text-muted-foreground">
          Consulta la informacion mas importante de tu rent car.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cartas.map((carta) => (
            <Card key={carta.title} className="gap-3 rounded-2xl p-5">
              <CardContent className="flex flex-col gap-2 p-0">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {carta.title}
                  </p>

                  <div className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <HugeiconsIcon
                      icon={carta.icon}
                      strokeWidth={1.75}
                      className="size-4"
                    />
                  </div>
                </div>

                <p className="text-3xl font-bold tracking-tight">
                  {carta.value}
                </p>

                <p className="text-xs text-muted-foreground">{carta.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        

        <Card className="rounded-2xl">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Ingresos por mes</CardTitle>
                <CardDescription>
                  Visualiza los ingresos generados durante el año.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="h-[350px]">
                  <GraficoIngresos data={ingresosPorMes} />
                </div>
              </CardContent>
            </Card>

            

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle>Vehiculos mas alquilados</CardTitle>
                  <CardDescription>
                    Top vehiculos con mayor numero de reservas
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="h-[350px]">
                    <VehiculosMasRentados data={vehiculosMasAlquilados} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ReportesVista
