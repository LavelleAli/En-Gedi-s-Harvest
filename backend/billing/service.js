// The $3/month Garden plan, billed through Stripe Checkout and the Stripe customer portal.
// Stripe is the source of truth for subscriptions; webhooks copy the status onto the account.
import { HttpError, log } from "@/backend/http";
import { PLANS } from "@/backend/accounts/repository";

const ACTIVE = new Set(["active", "trialing", "past_due"]); // past_due keeps access while Stripe retries the card

export function createBilling({ stripe, accounts, priceId, appUrl }) {
  return {
    async checkout(uid) {
      const account = await accounts.get(uid);
      if (account.plan === PLANS.garden) throw new HttpError(409, "already-subscribed", "You're already on the Garden plan");
      let customerId = account.stripeCustomerId;
      if (!customerId) {
        // Only the Firebase user ID goes to Stripe; Checkout collects the email and card itself.
        const customer = await stripe.customers.create({ metadata: { uid } }, { idempotencyKey: `customer-${uid}` });
        customerId = customer.id;
        await accounts.setBilling(uid, { stripeCustomerId: customerId });
      }
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        client_reference_id: uid,
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: { metadata: { uid } },
        success_url: `${appUrl}/account/?checkout=success`,
        cancel_url: `${appUrl}/account/?checkout=cancel`,
      });
      return { url: session.url };
    },

    async portal(uid) {
      const account = await accounts.get(uid);
      if (!account.stripeCustomerId) throw new HttpError(404, "no-billing", "There's no billing account yet", "Upgrade to the Garden plan first.");
      const session = await stripe.billingPortal.sessions.create({ customer: account.stripeCustomerId, return_url: `${appUrl}/account/` });
      return { url: session.url };
    },

    // Applies one verified Stripe event. Safe to receive twice: repeats are skipped.
    async handleEvent(event) {
      if (!(await accounts.firstTimeEvent(event.id))) return "duplicate";
      const obj = event.data.object;
      switch (event.type) {
        case "checkout.session.completed": {
          if (obj.mode !== "subscription" || !obj.client_reference_id) return "ignored";
          await accounts.setBilling(obj.client_reference_id, {
            plan: PLANS.garden, status: "active", stripeCustomerId: obj.customer, subscriptionId: obj.subscription,
          });
          return "subscribed";
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const uid = obj.metadata?.uid || (await accounts.findUidByCustomer(obj.customer));
          if (!uid) {
            log("error", "stripe subscription without account", { eventId: event.id });
            return "unmatched";
          }
          const active = event.type !== "customer.subscription.deleted" && ACTIVE.has(obj.status);
          await accounts.setBilling(uid, { plan: active ? PLANS.garden : PLANS.free, status: obj.status, subscriptionId: obj.id, stripeCustomerId: obj.customer });
          return active ? "active" : "ended";
        }
        default:
          return "ignored";
      }
    },

    // Ends billing right away when someone deletes their account.
    async cancelFor(uid) {
      const account = await accounts.get(uid);
      if (account.subscriptionId && account.plan === PLANS.garden) {
        try {
          await stripe.subscriptions.cancel(account.subscriptionId);
        } catch (err) {
          if (err?.code !== "resource_missing") throw err;
        }
      }
    },
  };
}
