// Account records in Firestore at users/{uid}: plan, billing IDs and this month's lookup count.
// No emails or names are stored here; Firebase Authentication keeps those.
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/backend/firebase";
import { HttpError } from "@/backend/http";

export const PLANS = { free: "free", garden: "garden" };

const blank = { plan: PLANS.free, status: "none", stripeCustomerId: null, subscriptionId: null, usage: { month: "", count: 0 } };

export function createAccounts(database = db()) {
  const users = database.collection("users");
  const events = database.collection("stripeEvents");

  return {
    async get(uid) {
      const snap = await users.doc(uid).get();
      return snap.exists ? { ...blank, ...snap.data() } : { ...blank };
    },

    // Counts one plant lookup against this month's allowance, atomically, before the expensive call.
    // Paid accounts have no monthly cap. Throws 402 when a free account has used its lookups.
    async reserveLookup(uid, month, freeLimit) {
      return database.runTransaction(async (tx) => {
        const ref = users.doc(uid);
        const snap = await tx.get(ref);
        const data = snap.exists ? { ...blank, ...snap.data() } : { ...blank };
        const used = data.usage?.month === month ? data.usage.count : 0;
        const paid = data.plan === PLANS.garden;
        if (!paid && used >= freeLimit) {
          throw new HttpError(402, "quota-exceeded", "You've used this month's free lookups", `Free accounts can research ${freeLimit} new plants a month. Upgrade to the Garden plan for unlimited lookups, or search the shared library, which is always free.`, { limit: freeLimit, used });
        }
        const next = { month, count: used + 1 };
        if (snap.exists) tx.update(ref, { usage: next, updatedAt: FieldValue.serverTimestamp() });
        else tx.set(ref, { ...blank, usage: next, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
        return { plan: data.plan, used: next.count, limit: paid ? null : freeLimit, month };
      });
    },

    // Gives back a reserved lookup when the research failed or found nothing.
    async refundLookup(uid, month) {
      await database.runTransaction(async (tx) => {
        const ref = users.doc(uid);
        const snap = await tx.get(ref);
        const usage = snap.exists ? snap.data().usage : null;
        if (usage?.month === month && usage.count > 0) tx.update(ref, { "usage.count": usage.count - 1 });
      });
    },

    async setBilling(uid, fields) {
      await users.doc(uid).set({ ...fields, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    },

    async findUidByCustomer(customerId) {
      const snap = await users.where("stripeCustomerId", "==", customerId).limit(1).get();
      return snap.empty ? null : snap.docs[0].id;
    },

    async remove(uid) {
      await users.doc(uid).delete();
    },

    // Records a Stripe event ID; returns false if it was already handled (Stripe retries webhooks).
    async firstTimeEvent(eventId) {
      try {
        await events.doc(eventId).create({ at: FieldValue.serverTimestamp() });
        return true;
      } catch (err) {
        if (err?.code === 6) return false; // ALREADY_EXISTS
        throw err;
      }
    },
  };
}
