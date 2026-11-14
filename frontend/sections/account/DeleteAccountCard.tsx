// Deleting the account, in a red-bordered card. It takes two clicks: "Delete my account…" shows the
// permanent delete button beside "Keep my account".
import { useState } from "react";
import Button from "@/frontend/components/ui/Button";
import Card from "@/frontend/components/ui/Card";

type DeleteAccountCardProps = {
  deleting: boolean;
  onDelete: () => Promise<void>;
};

export default function DeleteAccountCard({ deleting, onDelete }: DeleteAccountCardProps) {
  const [confirming, setConfirming] = useState(false);
  return (
    <Card as="section" danger className="grid content-start gap-4" aria-labelledby="delete-title">
      <h3 id="delete-title">Delete account</h3>
      <p>
        Cancels any subscription and permanently deletes your account and lookup history. Plants you researched stay in the shared library
        without your name. Synced copies of your starred plants, checklists and garden plan are deleted too; the copies in this browser stay.
      </p>
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="danger" onClick={() => onDelete().finally(() => setConfirming(false))} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete my account permanently"}
          </Button>
          <Button onClick={() => setConfirming(false)}>Keep my account</Button>
        </div>
      ) : (
        <div>
          <Button onClick={() => setConfirming(true)}>Delete my account…</Button>
        </div>
      )}
    </Card>
  );
}
