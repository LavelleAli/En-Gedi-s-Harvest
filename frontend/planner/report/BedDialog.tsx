"use client";

// A bed's full report in a window: its name, kind and size, light, each crop's report, companions and
// watering, with "Edit this bed" (selects it in the planner and goes to its editor) and Close. Opened from
// the Beds list. Fades in and out (500ms); Esc or a click outside closes it.
import { useEffect, useId } from "react";
import Button from "@/frontend/components/ui/Button";
import Dialog from "@/frontend/components/ui/Dialog";
import { useFadeDialog } from "@/frontend/lib/useFadeDialog";
import type { CompanionResult } from "../analysis";
import type { Bed } from "../model";
import Badge from "./Badge";
import BedDetails from "./BedDetails";
import { LIGHT_TONE, type BedFacts } from "./bedFacts";

type BedDialogProps = {
  open: boolean;
  shown: { bed: Bed; facts: BedFacts; companions: CompanionResult } | null;
  zone: string;
  month: number;
  onEdit: (id: string) => void;
  onClose: () => void; // after it has faded out (Close, Esc, a click outside, or Edit this bed)
};

export default function BedDialog({ open, shown, zone, month, onEdit, onClose }: BedDialogProps) {
  const titleId = useId();
  const { ref, open: show, close, onCancel, onClick } = useFadeDialog({ onClosed: onClose });
  // The report opens and closes the window through the `open` prop.
  useEffect(() => {
    if (open) show();
    else close();
  }, [open, show, close]);

  const edit = () => {
    if (shown) onEdit(shown.bed.id);
    close();
  };

  return (
    <Dialog dialogRef={ref} onCancel={onCancel} onBackdropClick={onClick} titleId={titleId} wide>
      {shown && (
        <article className="grid content-start gap-4">
          <header className="grid gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id={titleId}>{shown.bed.name}</h2>
              <div className="flex gap-2">
                <Button onClick={edit}>Edit this bed</Button>
                <Button variant="primary" onClick={close}>
                  Close
                </Button>
              </div>
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                {shown.facts.kind} · {shown.facts.size}
              </span>
              <Badge tone={LIGHT_TONE[shown.facts.light.id]}>
                {shown.facts.light.label} · {shown.facts.hours.toFixed(1)} h
              </Badge>
            </p>
          </header>
          <BedDetails bed={shown.bed} facts={shown.facts} companions={shown.companions} zone={zone} month={month} onEdit={edit} />
        </article>
      )}
    </Dialog>
  );
}
