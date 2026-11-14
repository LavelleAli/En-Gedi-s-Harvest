// A glass card around a table. A wide table scrolls sideways inside it on small screens instead of
// widening the page; on paper it's never cut off.
//   <TableCard><table>…</table></TableCard>
//   <TableCard fit>…</TableCard>   a compact table that should fit its card rather than keep 34rem
// The table, th and td themselves use the base table styles in globals.css.
import type { HTMLAttributes } from "react";
import { cx } from "@/frontend/lib/cx";

const CARD = [
  // Glass card; scrolls sideways when the table doesn't fit.
  "overflow-x-auto rounded-lg border border-line bg-panel shadow-card backdrop-blur-glass",
  // Paper: no scrolling, the table fits the page.
  "print:overflow-visible print:[&>table]:min-w-0",
].join(" ");

// Wide tables keep at least 34rem, so their columns stay readable (scrolling inside the card instead).
const KEEP_WIDTH = "[&>table]:min-w-[34rem]";

type TableCardProps = HTMLAttributes<HTMLDivElement> & { fit?: boolean };

export default function TableCard({ fit, className, ...rest }: TableCardProps) {
  return <div className={cx(CARD, !fit && KEEP_WIDTH, className)} {...rest} />;
}
