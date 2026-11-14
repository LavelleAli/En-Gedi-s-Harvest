"use client";

// The account page while signed in: any news (checkout, deletion) or error, the account and plan
// cards, a link to the shop, and deleting the account.
import { useState } from "react";
import { api } from "@/frontend/account/api";
import { signOutUser, type AuthUser } from "@/frontend/account/auth";
import ButtonLink from "@/frontend/components/ui/ButtonLink";
import Callout from "@/frontend/components/ui/Callout";
import Card from "@/frontend/components/ui/Card";
import CardRow from "./CardRow";
import DeleteAccountCard from "./DeleteAccountCard";
import PlanCompare from "./PlanCompare";
import SignedInCard from "./SignedInCard";
import { asApiError, useAccountSummary } from "./useAccountSummary";

export default function AccountHome({ user }: { user: AuthUser }) {
  const { account, error, setError, notice, setNotice } = useAccountSummary();
  const [busy, setBusy] = useState(""); // "portal", "checkout", "delete" or ""

  // Billing and checkout happen on Stripe's pages: ask the server for the address, then go there.
  const goToStripe = async (path: string, label: string) => {
    setBusy(label);
    try {
      const { url } = await api<{ url: string }>(path, { method: "POST", auth: true });
      window.location.assign(url);
    } catch (err) {
      setError(asApiError(err));
      setBusy("");
    }
  };

  const remove = async () => {
    setBusy("delete");
    try {
      await api("/api/account/", { method: "DELETE", auth: true });
      await signOutUser().catch(() => {});
      setNotice("Your account and its data are deleted.");
    } catch (err) {
      setError(asApiError(err));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="grid gap-6">
      {notice && <Callout tone="green" title={notice} role="status" />}
      {error && (
        <Callout title={error.title} role="alert">
          {error.detail && <p>{error.detail}</p>}
        </Callout>
      )}
      <CardRow>
        <SignedInCard
          who={user.email || user.name || ""}
          account={account}
          loading={!account && !error}
          busy={busy}
          onManageBilling={() => goToStripe("/api/billing/portal/", "portal")}
        />
        <PlanCompare
          current={account?.plan}
          busy={busy === "checkout"}
          billingAvailable={account?.billingAvailable}
          onUpgrade={() => goToStripe("/api/billing/checkout/", "checkout")}
        />
      </CardRow>
      <Card as="section" className="grid content-start gap-4" aria-labelledby="shop-title">
        <h3 id="shop-title">Gear shop</h3>
        <p>Beekeeping, water filtration and garden supplies for the projects in the book. Coming soon.</p>
        <div>
          <ButtonLink href="/shop/">Browse the shop</ButtonLink>
        </div>
      </Card>
      <DeleteAccountCard deleting={busy === "delete"} onDelete={remove} />
    </div>
  );
}
