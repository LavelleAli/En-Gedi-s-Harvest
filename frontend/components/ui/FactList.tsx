// A two-column list of labelled facts: the label (dt) on the left in muted text, the value (dd) beside it.
//   <FactList><dt>Zone</dt><dd>8a</dd>…</FactList>
import type { HTMLAttributes } from "react";
import { cx } from "@/frontend/lib/cx";

const LIST = "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[0.9375rem] [&_dt]:font-semibold [&_dt]:text-muted";

export default function FactList({ className, ...rest }: HTMLAttributes<HTMLDListElement>) {
  return <dl className={cx(LIST, className)} {...rest} />;
}
