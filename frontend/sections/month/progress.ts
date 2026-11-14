// Counts how many checklist items are ticked, across one or more groups (a month's packets).
import type { ChecklistGroup, Done } from "@/frontend/lib/todos";

export type Progress = { done: number; total: number };

export function countDone(groups: ChecklistGroup[], done: Done): Progress {
  const keys = groups.flatMap((g) => g.items.map((i) => i.key));
  return { done: keys.filter((k) => done[k]).length, total: keys.length };
}

// Whole percent done, 0 when there's nothing to do.
export const percent = ({ done, total }: Progress) => (total ? Math.round((done / total) * 100) : 0);
