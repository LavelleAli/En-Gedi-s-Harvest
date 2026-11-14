// The rules for synced saved data: which keys are allowed, how big a value can be, and that a
// newer save always wins. The store is passed in, so tests can use a fake one.
import { z } from "zod";
import { HttpError, parseOr400 } from "@/backend/http";
import { MAX_VALUE_CHARS, SYNCED_KEYS, isSyncedKey } from "@/shared/saved-data";
import type { SavedStore } from "@/backend/saved/store";

const Save = z
  .object({
    key: z.enum(SYNCED_KEYS),
    value: z.string().max(MAX_VALUE_CHARS),
    updatedAt: z.number().int().positive(), // milliseconds, from the device that made the change
  })
  .strict();

// A device clock can run a little fast; more than this and we refuse the timestamp, because a
// value dated far in the future would win against every real change after it.
const CLOCK_SLACK_MS = 5 * 60 * 1000;

export function createSavedService({ store, now = () => Date.now() }: { store: SavedStore; now?: () => number }) {
  return {
    async list(uid: string) {
      const all = await store.all(uid);
      // Ignore anything stored under a key that's no longer synced.
      return Object.fromEntries(Object.entries(all).filter(([key]) => isSyncedKey(key)));
    },

    async save(uid: string, body: unknown) {
      const { key, value, updatedAt } = parseOr400(Save, body);
      if (updatedAt > now() + CLOCK_SLACK_MS) {
        throw new HttpError(400, "clock-ahead", "This device's clock is ahead", "Check the date and time on this device, then try again.");
      }
      return store.putIfNewer(uid, key, value, updatedAt);
    },
  };
}
