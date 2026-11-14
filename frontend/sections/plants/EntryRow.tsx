// One plant in the encyclopedia: its row (the toggle and the star), and the full entry under it while
// open. Opening grows the card from nothing over 400ms; closing shrinks it over 300ms first, then takes
// it out of the page. Only the row the reader clicked animates; with reduced motion it opens at once.
import { useRef } from "react";
import { EASE, duration, gsap, reducedMotion, useGSAP } from "@/frontend/lib/motion";
import EntryCard from "./EntryCard";
import EntryToggle from "./EntryToggle";
import StarButton from "./StarButton";
import type { Entry } from "./entries";

type EntryRowProps = {
  entry: Entry;
  zone: string;
  starred: boolean;
  onStar: (title: string) => void;
  open: boolean;
  onToggle: (id: string) => void;
  animate: boolean; // true for the row the reader just clicked
};

export default function EntryRow({ entry, zone, starred, onStar, open, onToggle, animate }: EntryRowProps) {
  const { title, id } = entry;
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!open || !animate || !cardRef.current) return;
      gsap.from(cardRef.current, { height: 0, opacity: 0, overflow: "hidden", duration: duration(0.4), ease: EASE, clearProps: "height,opacity,overflow" });
    },
    { dependencies: [open] },
  );

  const toggle = () => {
    const card = cardRef.current;
    if (!open || !card || reducedMotion()) return onToggle(id);
    gsap.to(card, { height: 0, opacity: 0, overflow: "hidden", duration: duration(0.3), ease: EASE, onComplete: () => onToggle(id) });
  };

  return (
    // "entry" is a test hook and what Reveal fades up. "group/entry" lets the name react to data-open and
    // to :target (a link to #plant-…). scroll-mt keeps a linked row clear of the top of the window.
    <article
      className="entry group/entry scroll-mt-20 border-b border-line print:break-inside-avoid"
      id={id}
      aria-labelledby={`${id}-title`}
      data-open={open || undefined}
    >
      <header className="flex items-center justify-between gap-2">
        {/* The heading holds the button (the APG accordion pattern); it takes no heading styles of its own. */}
        <h4 className="m-0 min-w-0 flex-1 [font:inherit]">
          <EntryToggle entry={entry} open={open} onClick={toggle} />
        </h4>
        <StarButton title={title} starred={starred} onStar={() => onStar(title)} />
      </header>
      {open && <EntryCard entry={entry} zone={zone} ref={cardRef} />}
    </article>
  );
}
