"use client";

// The account page: sign in or create an account, see this month's plant lookups, upgrade to the
// Garden plan ($3/month through Stripe), manage billing, sign out, or delete the account.
import { useAuth } from "@/frontend/account/auth";
import Callout from "@/frontend/components/ui/Callout";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import AccountHome from "./AccountHome";
import CardRow from "./CardRow";
import PlanCompare from "./PlanCompare";
import SignInCard from "./SignInCard";
import Page from "@/frontend/components/ui/Page";

export default function AccountPage() {
  const { status, user } = useAuth();
  return (
    <Page>
      <SectionHeader
        kicker="Your account"
        title="Account and plans"
        lead={
          <>
            You don&apos;t need an account to read the book or use the garden planner. An account lets you research plants that aren&apos;t in
            the stock list: Claude searches extension services and seed companies and fills in a growing guide for your zone.
          </>
        }
      />
      {status === "disabled" && (
        <Callout tone="yellow" title={<>Accounts aren&apos;t turned on for this copy of the site</>}>
          <p>The offline version has no server. On the online version, accounts work once Firebase is set up (see the README).</p>
        </Callout>
      )}
      {status === "loading" && <p role="status">Checking sign-in…</p>}
      {status === "signed-out" && (
        <CardRow>
          <SignInCard />
          <PlanCompare />
        </CardRow>
      )}
      {status === "signed-in" && user && <AccountHome user={user} />}
    </Page>
  );
}
