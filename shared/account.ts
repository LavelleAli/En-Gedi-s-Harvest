// What GET /api/account/ returns (backend/handlers/account.ts) and the account page reads
// (frontend/account/AccountPage.tsx). One type, so the two can't drift apart.
export type AccountSummary = {
  uid: string;
  plan: "free" | "garden";
  status: string;
  hasBilling: boolean;
  billingAvailable: boolean;
  // limit is null on the Garden plan (no monthly cap)
  usage: { month: string; used: number; limit: number | null };
};
