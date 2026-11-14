// Layout shared by the planner's editors.

// An editor's sections, stacked.
export const STACK = "grid content-start gap-4";
// A group within an editor (a heading and its list), stacked tighter.
export const GROUP = "grid content-start gap-2";
// Number boxes side by side: as many 7rem columns as fit (two in the narrow side panel).
export const PAIR = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,7rem),1fr))] gap-3";
// A list of names with a link or note beside each, divided by hairlines.
export const ROWS = "m-0 grid list-none p-0";
export const ROW = "flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-line py-2";
