// Date helpers for the planner's sun controls.

// Today as "2026-11-14", in the reader's own time zone.
export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// The quick picks: the equinoxes and solstices of a year.
export function quickDates(year: string): [label: string, date: string][] {
  return [
    ["Spring equinox", `${year}-03-20`],
    ["Summer solstice", `${year}-06-21`],
    ["Fall equinox", `${year}-09-22`],
    ["Winter solstice", `${year}-12-21`],
  ];
}
