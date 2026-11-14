// One plan in the comparison: its name, price and what it includes. The reader's current plan is
// tinted green with a ring and labelled "Your plan", so it isn't shown by color alone.
import type { ReactNode } from "react";
import { cx } from "@/frontend/lib/cx";

type PlanBoxProps = {
  name: string;
  price: string; // "$0", "$3"
  per?: string; // "/month"
  features: string[];
  current: boolean;
  children?: ReactNode; // e.g. an upgrade button
};

export default function PlanBox({ name, price, per, features, current, children }: PlanBoxProps) {
  return (
    <div
      className={cx(
        "grid content-start gap-2 rounded-md border p-4",
        current ? "border-green bg-green-soft shadow-[inset_0_0_0_1px_var(--green)]" : "border-line bg-surface",
      )}
    >
      <h4>{name}</h4>
      <p className="font-display text-[1.75rem] font-extrabold">
        {price}
        {per && <span className="text-sm font-semibold text-muted">{per}</span>}
      </p>
      <ul className="m-0 grid gap-1 ps-[1.1rem] text-sm">
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      {current && <p className="text-xs font-bold tracking-[0.08em] text-green-ink uppercase">Your plan</p>}
      {children}
    </div>
  );
}
