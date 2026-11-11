// GET    /api/account   the signed-in user's plan and this month's lookups
// DELETE /api/account   cancels any subscription and deletes the account and its data
import { config, isConfigured } from "@/backend/config";
import { json, route } from "@/backend/http";
import { adminAuth, requireUser } from "@/backend/firebase";
import { accountStore, billingService } from "@/backend/handlers/deps";
import { monthKey } from "@/backend/plants/service";
import { createSavedStore } from "@/backend/saved/store";

export const getAccount = route("account.get", async (req, { requestId }) => {
  const user = await requireUser(req);
  const account = await accountStore().get(user.uid);
  const month = monthKey(new Date());
  const used = account.usage?.month === month ? account.usage.count : 0;
  const paid = account.plan === "garden";
  return json(
    {
      uid: user.uid,
      plan: account.plan,
      status: account.status,
      hasBilling: !!account.stripeCustomerId,
      billingAvailable: isConfigured("stripe"),
      usage: { month, used, limit: paid ? null : config("limits").FREE_LOOKUPS_PER_MONTH },
    },
    { requestId },
  );
});

export const deleteAccount = route("account.delete", async (req) => {
  const user = await requireUser(req);
  if (isConfigured("stripe")) await billingService().cancelFor(user.uid);
  await accountStore().remove(user.uid);
  await createSavedStore().removeAll(user.uid); // starred plants, checklists and garden plan
  await adminAuth().deleteUser(user.uid);
  return new Response(null, { status: 204 });
});
