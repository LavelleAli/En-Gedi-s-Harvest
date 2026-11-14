// The planner's selector buttons (camera views, quick dates, the map and snap toggles, the add tiles, acre
// presets, edges): flat with no border until pointed at, then a hairline border and a light fill
// (300ms). While on (aria-pressed), filled with the accent. They're plain <button>s on the base style.
export const SELECT = [
  "rounded-md border-transparent bg-transparent shadow-none transition-colors",
  "hover:border-line-strong hover:bg-surface",
  "aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-on-accent",
].join(" ");

// A smaller selector, for rows of quick picks.
export const SELECT_SMALL = `${SELECT} min-h-9 px-3 text-[0.8125rem]`;
