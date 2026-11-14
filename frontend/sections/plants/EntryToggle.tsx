// The clickable part of a plant's row: a thumbnail (photo, or the first letter), the name, its botanical
// name and group, and a chevron that turns over while the entry is open. "group/toggle" lets the chevron
// follow the button's aria-expanded; "group/entry" (on the row) lets the name grow while open.
import { TYPE } from "@/frontend/data/plants";
import { getPhoto } from "@/frontend/components/Photo";
import { KIND_LABEL } from "@/shared/crop";
import { slug } from "@/shared/slug";
import { FLOWER_ONE, LIFE, type Entry } from "./entries";

const BUTTON = [
  // A full-width row, tall enough for the thumbnail.
  "group/toggle flex min-h-18 w-full items-center gap-3 rounded-md border-0 bg-transparent p-2 text-start shadow-none",
  // A quiet 300ms hover fill, and no press nudge.
  "transition-colors hover:bg-surface active:transform-none",
].join(" ");

// headword: also a test hook. Bigger while the entry is open; green when a link points at it (#plant-…).
const HEADWORD = [
  "headword block font-display text-lg leading-[1.2] font-extrabold tracking-[-0.01em]",
  "group-data-open/entry:text-xl group-target/entry:text-green-ink",
].join(" ");

type EntryToggleProps = { entry: Entry; open: boolean; onClick: () => void };

export default function EntryToggle({ entry, open, onClick }: EntryToggleProps) {
  const { crop, book, title, id } = entry;
  const photo = getPhoto(`plant-${slug(title)}`);
  const group = book ? TYPE[book.t] : crop.flower ? FLOWER_ONE[crop.flower.group] : KIND_LABEL[crop.kind];
  return (
    <button type="button" className={BUTTON} aria-expanded={open} aria-controls={`${id}-card`} onClick={onClick}>
      <span
        className="grid size-14 flex-none place-items-center overflow-hidden rounded-md bg-green-soft font-display text-xl font-extrabold text-green-ink"
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {photo ? <img src={photo.file} alt="" loading="lazy" className="size-full object-cover" /> : <span>{title[0]}</span>}
      </span>
      <span className="grid min-w-0 gap-[0.15rem]">
        <span className={HEADWORD} id={`${id}-title`}>
          {title}
        </span>
        <span className="block text-sm font-normal text-muted">
          {crop.botanical && <i>{crop.botanical}</i>}
          {crop.botanical && " · "}
          {group} · {LIFE[crop.life]}
        </span>
      </span>
      <svg
        className="ms-auto flex-none text-muted transition-transform group-aria-expanded/toggle:rotate-180 print:hidden"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}
