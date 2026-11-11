// Synced saved data in Firestore at savedData/{uid}/items/{key}, one document per key:
//   { value: "<the localStorage string>", updatedAt: <milliseconds> }
// Kept apart from users/{uid} (plan and billing) so this data can't affect billing records.
import { db } from "@/backend/firebase";

export function createSavedStore(database = db()) {
  const userDoc = (uid) => database.collection("savedData").doc(uid);
  const items = (uid) => userDoc(uid).collection("items");

  return {
    // Every saved item for one reader, as { key: { value, updatedAt } }.
    async all(uid) {
      const snap = await items(uid).get();
      return Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]));
    },

    // Saves the value only if it's newer than what's stored. Runs in a transaction so two
    // devices saving at the same moment can't overwrite each other out of order.
    // Returns { saved, item } where item is what's stored afterwards.
    async putIfNewer(uid, key, value, updatedAt) {
      return database.runTransaction(async (tx) => {
        const ref = items(uid).doc(key);
        const snap = await tx.get(ref);
        const current = snap.exists ? snap.data() : null;
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
