// POST /api/billing/checkout   start a Stripe Checkout session for the Garden plan
// POST /api/billing/portal     open the Stripe customer portal (change card, cancel)
// POST /api/billing/webhook    Stripe events; verified by signature, so no sign-in
import { config } from "@/backend/config";
import { HttpError, clientIp, json, log, rateLimit, route } from "@/backend/http";
import { requireUser } from "@/backend/firebase";
import { billingService, stripeClient } from "@/backend/handlers/deps";

export const checkout = route("billing.checkout", async (req, { requestId }) => {
  rateLimit(`billing:${clientIp(req)}`, 10, 60_000);
  const user = await requireUser(req);
  return json(await billingService().checkout(user.uid), { requestId });
});

export const portal = route("billing.portal", async (req, { requestId }) => {
  rateLimit(`billing:${clientIp(req)}`, 10, 60_000);
  const user = await requireUser(req);
  return json(await billingService().portal(user.uid), { requestId });
});

export const webhook = route("billing.webhook", async (req, { requestId }) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) throw new HttpError(400, "bad-signature", "Missing Stripe signature");
  const raw = await req.text(); // the signature covers the exact raw body
  if (raw.length > 512_000) throw new HttpError(413, "too-large", "Request body is too large");
  let event;
  try {
    event = stripeClient().webhooks.constructEvent(raw, signature, config("stripe").STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new HttpError(400, "bad-signature", "Stripe signature didn't verify");
  }
  const outcome = await billingService().handleEvent(event);
  log("info", "stripe event", { type: event.type, eventId: event.id, outcome, requestId });
  return json({ received: true }, { requestId });
});
