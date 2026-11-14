// A to Z across the top: a link to each letter that has plants in the current list, and a faded
// letter (hidden from screen readers) for the ones that don't. Not printed.
import { LETTERS } from "./entries";

// One square per letter.
const SQUARE = "inline-grid size-9 place-items-center rounded-sm font-display font-bold no-underline";
const LINK = `${SQUARE} border border-line bg-panel text-fg transition-[background-color,border-color] hover:border-line-strong hover:bg-surface`;

export default function LetterIndex({ has }: { has: (letter: string) => boolean }) {
  return (
    <nav className="flex flex-wrap gap-1 print:hidden" aria-label="Jump to a letter">
      {LETTERS.map((l) =>
        has(l) ? (
          <a key={l} href={`#letter-${l}`} className={LINK}>
            {l}
          </a>
        ) : (
          <span key={l} className={`${SQUARE} text-line-strong`} aria-hidden="true">
            {l}
          </span>
        ),
      )}
    </nav>
  );
}
