import { getClientsByOwner } from "@/services/clients";
import { ClientsPageClient } from "./clients-page-clients";

export const metadata = {
  title: "Clientes · PickyRentCar",
};

export default async function ClientesPage() {
  const clients = await getClientsByOwner();

  return <ClientsPageClient clients={clients} />;
}
