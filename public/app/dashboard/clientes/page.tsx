import { getClientsByOwner } from "@/services/clients";
import { ClientsPageClient } from "../../../components/clientes/Clientes";

export const metadata = { title: "Clientes · PickyRentCar" };

export default async function ClientesPage() {
  const clientes = await getClientsByOwner();

  return <ClientsPageClient clientes={clientes} />;
}
