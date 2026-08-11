"use server";

import { getClientDetails } from "@/services/clients";

export async function getClientDetailsAction(clientId: string) {
  return getClientDetails(clientId);
}
