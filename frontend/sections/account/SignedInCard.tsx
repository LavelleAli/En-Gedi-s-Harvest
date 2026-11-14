// "Signed in": the reader's email, their plan and this month's lookups, and buttons to manage billing
// (when they have a subscription) or sign out.
import { signOutUser } from "@/frontend/account/auth";
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";
import FactList from "@/frontend/components/ui/FactList";
import type { AccountSummary } from "@/shared/account";

type SignedInCardProps = {
  who: string; // email, or name
  account: AccountSummary | null; // null while loading
  loading: boolean;
  busy: string; // which action is running: "portal", "checkout", "delete" or ""
  onManageBilling: () => void;
};

export default function SignedInCard({ who, account, loading, busy, onManageBilling }: SignedInCardProps) {
  const usage = account?.usage;
  const monthName = usage ? new Date(`${usage.month}-15T12:00:00Z`).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" }) : "";
  return (
    <Card as="section" className="grid content-start gap-4" aria-labelledby="you-title">
      <h3 id="you-title">Signed in</h3>
      <p>{who}</p>
      {account && (
        <FactList>
          <dt>Plan</dt>
          <dd>{account.plan === "garden" ? "Garden ($3/month)" : "Free"}</dd>
          <dt>Lookups</dt>
          <dd>
            {!usage
              ? null
              : usage.limit === null
                ? `${usage.used} new plants researched in ${monthName} (unlimited)`
                : `${usage.used} of ${usage.limit} new-plant lookups used in ${monthName}`}
          </dd>
        </FactList>
      )}
      {loading && <p>Loading your account…</p>}
      <div className="flex flex-wrap items-center gap-2">
        {account?.hasBilling && (
          <Button onClick={onManageBilling} disabled={!!busy}>
            {busy === "portal" ? "Opening…" : "Manage billing"}
          </Button>
        )}
        <Button onClick={() => signOutUser()} disabled={!!busy}>
          Sign out
        </Button>
      </div>
    </Card>
  );
}
