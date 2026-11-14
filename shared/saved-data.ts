// Saved data that follows a signed-in reader to their other devices.
// Shared by the browser (frontend/account/sync.ts) and the server (backend/saved/service.ts),
// so both sides agree on exactly which keys sync.
//
// Each entry is a localStorage key and the event its store listens for. When a synced value
// arrives, the browser writes it to localStorage and fires that event so the screen redraws.
//
// Not synced on purpose: "fhb-location" (where you live is personal) and "fhb-theme"
// (light or dark is a per-device choice).
export const SYNCED = {
  "fhb-stars": "fhb-stars-change", // starred plants (PlantsSection)
  "fhb-gear": "fhb-gear-change", // gear checklists (RichSection)
  "fhb-todo": "fhb-todo-change", // monthly to-dos (lib/todos.ts)
  "fhb-garden": "fhb-garden-change", // garden layout (planner/model.ts)
  "fhb-crops": "fhb-garden-change", // crops added to the planner (planner/model.ts)
} as const;

export type SyncedKey = keyof typeof SYNCED;
// Written out as a non-empty list so z.enum() accepts it on the server.
export const SYNCED_KEYS = Object.keys(SYNCED) as [SyncedKey, ...SyncedKey[]];
export const isSyncedKey = (key: string): key is SyncedKey => (SYNCED_KEYS as string[]).includes(key);
/** One synced value as stored: the localStorage string and when it was last changed (ms). */
export type SavedItem = { value: string; updatedAt: number };

// Largest single value the server accepts, in characters (about 200 KB).
export const MAX_VALUE_CHARS = 200_000;
