// What the Tools menu lists: a link to every page of the book, then "Take the tour".
// The current page is filled with the accent color.
import Link from "next/link";
import { ROUTES } from "@/frontend/data/routes";
import { startTour } from "@/frontend/lib/tour";

// One page link, grouped by job.
const PAGE_LINK = [
  // A row with the section's color dot, at least one touch target tall.
  "group flex min-h-tap items-center gap-2 rounded-md px-3 py-2",
  // Text and the 300ms hover fill.
  "text-sm font-semibold text-fg no-underline transition-colors hover:bg-surface",
  // The current page: accent fill.
  "aria-[current=page]:bg-accent aria-[current=page]:text-on-accent",
].join(" ");

// "Take the tour": a full-width row like the page links, quieter until pointed at.
const TOUR_ROW = [
  "flex w-full min-h-tap cursor-pointer items-center rounded-md border-0 bg-transparent px-3 py-2 shadow-none",
  "text-sm font-semibold text-muted transition-colors hover:bg-surface hover:text-fg",
].join(" ");

type ToolsLinksProps = {
  pathname: string; // the current page, normalized (frontend/lib/paths.ts)
  onPick: () => void; // closes the menu once a page or the tour is picked
};

export default function ToolsLinks({ pathname, onPick }: ToolsLinksProps) {
  return (
    <>
      {/* Two columns, so all thirteen pages fit without scrolling on most screens. */}
      <nav aria-label="Sections" className="grid grid-cols-2 gap-1">
        {ROUTES.map((r) => (
          <Link key={r.href} href={r.href} className={PAGE_LINK} aria-current={pathname === r.href ? "page" : undefined} onClick={onPick}>
            {/* The section's color. On the current page a ring keeps it visible on the accent fill. */}
            <span
              className="size-2 flex-none rounded-full group-aria-[current=page]:shadow-[0_0_0_2px_var(--on-accent)]"
              style={{ background: r.color }}
              aria-hidden="true"
            />
            {r.label}
          </Link>
        ))}
      </nav>
      <div className="mt-2 border-t border-line pt-2">
        <button
          type="button"
          className={TOUR_ROW}
          onClick={() => {
            onPick();
            startTour();
          }}
        >
          Take the tour
        </button>
      </div>
    </>
  );
}
