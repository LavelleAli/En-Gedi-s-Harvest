// "Research … with Claude": what research does and costs, then (by sign-in status) why it isn't
// available, a link to sign in, or the button; while it runs, a spinner, seconds and Cancel; then the
// result (a crop card to add) or what went wrong.
import Link from "next/link";
import Button from "@/frontend/components/ui/Button";
import Callout from "@/frontend/components/ui/Callout";
import Card from "@/frontend/components/ui/Card";
import Spinner from "@/frontend/components/ui/Spinner";
import type { Crop } from "@/shared/crop";
import CropCard from "./CropCard";
import type { ResearchState } from "./useResearch";

type ResearchBoxProps = {
  name: string; // what the reader typed
  zone: string;
  status: string; // sign-in status: "disabled", "signed-out", "signed-in", "loading"
  research: ResearchState;
  elapsed: number; // seconds so far
  onRun: () => void;
  onCancel: () => void;
  bedName: string;
  onAdd: (crop: Crop) => void;
};

export default function ResearchBox({ name, zone, status, research, elapsed, onRun, onCancel, bedName, onAdd }: ResearchBoxProps) {
  return (
    <Card className="grid content-start gap-2">
      <h3 className="text-md">Research “{name}” with Claude</h3>
      <p>
        Claude searches extension services and seed companies and writes a growing guide for zone {zone}. It joins the shared library for
        everyone. Free accounts get 5 new plants a month; the Garden plan is unlimited.
      </p>
      {status === "disabled" && <p>Accounts aren&apos;t turned on for this copy of the site, so research isn&apos;t available. You can enter the plant by hand.</p>}
      {status === "signed-out" && (
        <p>
          <Link href="/account/">Sign in or create a free account</Link> to research plants.
        </p>
      )}
      {status === "signed-in" && research.state !== "loading" && (
        <div>
          <Button variant="primary" onClick={onRun}>
            Research it
          </Button>
        </div>
      )}
      {research.state === "loading" && (
        <div className="flex flex-wrap items-center gap-2" role="status">
          <Spinner />
          <span>Searching and reading sources… {elapsed}s (usually under a minute)</span>
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      )}
      {research.state === "error" && (
        <Callout title={research.error.title} role="alert">
          {research.error.detail && <p>{research.error.detail}</p>}
          {research.error.code === "quota-exceeded" && (
            <p>
              <Link href="/account/">Upgrade to the Garden plan</Link> for unlimited lookups.
            </p>
          )}
          {research.error.code === "sign-in-required" && (
            <p>
              <Link href="/account/">Sign in</Link> and try again.
            </p>
          )}
        </Callout>
      )}
      {research.state === "done" && (
        <>
          <p role="status">
            {research.source === "research" ? `Researched for zone ${zone}.` : "Already known, so this lookup was free."}
            {research.usage?.limit ? ` You've used ${research.usage.used} of ${research.usage.limit} lookups this month.` : ""}
          </p>
          <CropCard crop={research.crop} bedName={bedName} onAdd={onAdd} />
        </>
      )}
    </Card>
  );
}
