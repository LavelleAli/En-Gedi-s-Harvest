// The grid every page's content sits in: its parts stacked 1.5rem apart, none wider than the column.
//   <Page><SectionHeader …/>…</Page>
// "view" has no styles of its own: it marks a page for the whole-book page (app/book/page.tsx), which
// draws a rule between pages and starts each one on a new printed page.
import type { ReactNode } from "react";
import { cx } from "@/frontend/lib/cx";

export const PAGE = "view grid gap-6 [&>*]:min-w-0";

export default function Page({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cx(PAGE, className)}>{children}</section>;
}
