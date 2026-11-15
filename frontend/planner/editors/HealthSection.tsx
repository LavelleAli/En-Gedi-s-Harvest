// The Health box in a chicken coop's, fish farm's or beehive's editor: a checklist to tick as you look
// things over (saved with the item; "Start over" clears it for the next round) and a few tips, with a link
// to the full page.
import Link from "next/link";
import { useId } from "react";
import Button from "@/frontend/components/ui/Button";
import type { HealthBox } from "../health";
import { GROUP } from "./editorStyle";

type HealthSectionProps = { box: HealthBox; ticked: string[] | undefined; onChange: (ticked: string[]) => void };

export default function HealthSection({ box, ticked = [], onChange }: HealthSectionProps) {
  const headingId = useId();
  const done = box.checks.filter((c) => ticked.includes(c.id)).length;
  return (
    <section className={`${GROUP} border-t border-line pt-3`} aria-labelledby={headingId}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 id={headingId}>{box.title}</h4>
        <span className="text-sm text-muted">
          {done} of {box.checks.length} checked
        </span>
      </div>
      <ul className="m-0 grid list-none gap-1.5 p-0">
        {box.checks.map((c) => {
          const on = ticked.includes(c.id);
          return (
            <li key={c.id}>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 shrink-0 cursor-pointer accent-green"
                  checked={on}
                  onChange={() => onChange(on ? ticked.filter((t) => t !== c.id) : [...ticked, c.id])}
                />
                <span>{c.text}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {done > 0 && (
        <Button variant="quiet" className="justify-self-start" onClick={() => onChange([])}>
          Start over
        </Button>
      )}
      <h5 className="m-0 mt-1">Tips</h5>
      <ul className="m-0 grid gap-1 ps-5 text-sm">
        {box.tips.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <p className="text-sm">
        <Link href={box.page.href}>More on the {box.page.label} page</Link>
      </p>
    </section>
  );
}
