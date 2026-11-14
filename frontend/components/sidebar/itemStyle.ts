// The classes every sidebar item shares (the Account, Profile and Shop links and the Tools button),
// so they line up and hover the same way.
export const ITEM = [
  // Icon over label. Phones: a cell in the bottom bar. Wider screens: a rounded tile in the left column.
  "flex min-h-15 flex-col items-center justify-center gap-[0.2rem] rounded-none border-0 bg-transparent px-1 py-2 shadow-none",
  "md:min-h-17 md:rounded-md",
  // Text, and the hover fill (transition-colors runs 300ms, ease in and out). No press nudge.
  "text-xs font-semibold text-muted no-underline transition-colors hover:bg-surface hover:text-fg active:transform-none",
  // The current page is tinted green.
  "aria-[current=page]:bg-green-soft aria-[current=page]:text-green-ink",
].join(" ");
