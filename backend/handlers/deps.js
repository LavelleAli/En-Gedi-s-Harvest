// Builds the real services once per server instance. Tests construct the services with fakes instead.
import Stripe from "stripe";
import { config } from "@/backend/config";
import { createAccounts } from "@/backend/accounts/repository";
import { createBilling } from "@/backend/billing/service";
import { createLibrary } from "@/backend/plants/library";
import { researchPlant } from "@/backend/plants/research";
import { createPlantService } from "@/backend/plants/service";

let accounts;
let plants;
let billing;

export function accountStore() {
  accounts ??= createAccounts();
  return accounts;
}

export function plantService() {
  plants ??= createPlantService({
    library: createLibrary(),
    accounts: accountStore(),
    research: (name, zone) => researchPlant(name, zone),
    freeLimit: config("limits").FREE_LOOKUPS_PER_MONTH,
  });
  return plants;
}

export function stripeClient() {
  const { STRIPE_SECRET_KEY } = config("stripe");
  return new Stripe(STRIPE_SECRET_KEY, { timeout: 20_000, maxNetworkRetries: 2 });
}

export function billingService() {
  if (!billing) {
    const { STRIPE_PRICE_ID, APP_URL } = config("stripe");
    billing = createBilling({ stripe: stripeClient(), accounts: accountStore(), priceId: STRIPE_PRICE_ID, appUrl: APP_URL.replace(/\/$/, "") });
  }
  return billing;
}
