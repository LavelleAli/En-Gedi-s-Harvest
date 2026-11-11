// Server configuration from environment variables, validated with Zod. Each feature reads only the
// variables it needs, so a deployment without Stripe (for example) still serves plant searches.
// Secrets are never sent to the browser: none of these names start with NEXT_PUBLIC_.
import { z } from "zod";
import { HttpError } from "@/backend/http";

const schemas = {
  firebase: z.object({
    FIREBASE_PROJECT_ID: z.string().min(1),
    FIREBASE_CLIENT_EMAIL: z.string().email(),
    // Vercel stores multi-line keys with literal "\n"; turn them back into newlines.
    FIREBASE_PRIVATE_KEY: z.string().min(20).transform((k) => k.replace(/\\n/g, "\n")),
  }),
  anthropic: z.object({
    ANTHROPIC_API_KEY: z.string().min(10),
  }),
  stripe: z.object({
    STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
    STRIPE_PRICE_ID: z.string().startsWith("price_"),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
    APP_URL: z.string().url(),
  }),
  limits: z.object({
    FREE_LOOKUPS_PER_MONTH: z.coerce.number().int().min(0).max(1000).default(5),
  }),
};

const cache = {};

// Returns the validated settings for a feature, or logs what is missing and throws a 503.
export function config(feature) {
  if (cache[feature]) return cache[feature];
  const result = schemas[feature].safeParse(process.env);
  if (!result.success) {
    const missing = [...new Set(result.error.issues.map((i) => i.path.join(".")))].join(", ");
    console.error(JSON.stringify({ level: "error", msg: "config missing", feature, missing }));
    // The variable names go to the server log only; the client gets a generic message.
    throw new HttpError(503, "not-configured", "This feature isn't set up on the server yet", "The site owner needs to finish setting it up.");
  }
  cache[feature] = result.data;
  return result.data;
}

export function isConfigured(feature) {
  return schemas[feature].safeParse(process.env).success;
}
