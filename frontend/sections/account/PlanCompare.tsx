// The two plans side by side: Free and Garden ($3/month). Signed in on the Free plan, Garden offers an
// upgrade button (when billing is set up on this copy of the site).
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";
import Hint from "@/frontend/components/ui/Hint";
import type { AccountSummary } from "@/shared/account";
import PlanBox from "./PlanBox";

type PlanCompareProps = {
  current?: AccountSummary["plan"]; // left out when signed out
  onUpgrade?: () => void;
  busy?: boolean; // checkout is opening
  billingAvailable?: boolean;
};

export default function PlanCompare({ current, onUpgrade, busy = false, billingAvailable = true }: PlanCompareProps) {
  return (
    <Card as="section" className="grid content-start gap-4" aria-labelledby="plans-title">
      <h3 id="plans-title">Plans</h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))] gap-3">
        <PlanBox
          name="Free"
          price="$0"
          current={current === "free"}
          features={["The whole book, planner and stock plant list", "Search the shared plant library: unlimited", "Research 5 new plants a month with Claude"]}
        />
        <PlanBox
          name="Garden"
          price="$3"
          per="/month"
          current={current === "garden"}
          features={["Everything in Free", "Research new plants: unlimited", "Cancel any time from the billing page"]}
        >
          {current === "free" && billingAvailable && (
            <Button variant="primary" onClick={onUpgrade} disabled={busy}>
              {busy ? "Opening checkout…" : "Upgrade for $3/month"}
            </Button>
          )}
        </PlanBox>
      </div>
      <Hint>Every plant anyone researches joins the shared library, so popular plants are usually free to look up.</Hint>
    </Card>
  );
}
