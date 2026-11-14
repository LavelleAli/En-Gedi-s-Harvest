// The star beside each plant: adds it to "My garden". Off is a hollow outline and on is a filled gold
// star, so the state doesn't rely on color alone; aria-pressed tells screen readers. Not printed.
const STAR = [
  // A round 44px target with a big star in it.
  "w-tap min-h-tap flex-none rounded-full border-0 bg-transparent p-0 shadow-none",
  "text-[1.375rem] leading-none text-muted hover:bg-surface",
  // On: filled gold.
  "aria-pressed:text-star",
  // Off: hollow, drawn as an outline (where the browser supports text outlines).
  "supports-[-webkit-text-stroke:1px_black]:not-aria-pressed:text-transparent",
  "supports-[-webkit-text-stroke:1px_black]:not-aria-pressed:[-webkit-text-stroke:1.5px_var(--muted)]",
  "print:hidden",
].join(" ");

type StarButtonProps = { title: string; starred: boolean; onStar: () => void };

export default function StarButton({ title, starred, onStar }: StarButtonProps) {
  return (
    <button type="button" className={STAR} aria-label={`Star ${title}`} aria-pressed={starred} onClick={onStar}>
      ★
    </button>
  );
}
