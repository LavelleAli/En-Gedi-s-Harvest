// Synced saved data in Firestore at savedData/{uid}/items/{key}, one document per key:
//   { value: "<the localStorage string>", updatedAt: <milliseconds> }
// Kept apart from users/{uid} (plan and billing) so this data can't affect billing records.
import type { Firestore } from "firebase-admin/firestore";
import { db } from "@/backend/firebase";
import type { SavedItem } from "@/shared/saved-data";

/** What the saved-data service needs from storage. Tests pass an in-memory fake. */
export interface SavedStore {
  all(uid: string): Promise<Record<string, SavedItem>>;
  putIfNewer(uid: string, key: string, value: string, updatedAt: number): Promise<{ saved: boolean; item: SavedItem }>;
  removeAll(uid: string): Promise<void>;
}

export function createSavedStore(database: Firestore = db()): SavedStore {
  const userDoc = (uid: string) => database.collection("savedData").doc(uid);
  const items = (uid: string) => userDoc(uid).collection("items");

  return {
    // Every saved item for one reader, as { key: { value, updatedAt } }.
    async all(uid) {
      const snap = await items(uid).get();
      return Object.fromEntries(snap.docs.map((d) => [d.id, d.data() as SavedItem]));
    },

    // Saves the value only if it's newer than what's stored. Runs in a transaction so two
    // devices saving at the same moment can't overwrite each other out of order.
    // Returns { saved, item } where item is what's stored afterwards.
    async putIfNewer(uid, key, value, updatedAt) {
      return database.runTransaction(async (tx) => {
        const ref = items(uid).doc(key);
        const snap = await tx.get(ref);
        const current = snap.exists ? (snap.data() as SavedItem) : null;
        if (current && current.updatedAt >= updatedAt) return { saved: false, item: current };
        const item = { value, updatedAt };
        tx.set(ref, item);
        return { saved: true, item };
      });
    },

    // Deletes everything this reader has synced. Used when they delete their account.
    async removeAll(uid) {
      await database.recursiveDelete(userDoc(uid));
    },
  };
}
