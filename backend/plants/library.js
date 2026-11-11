// The shared plant library in Firestore: every plant someone has researched, so the next person who
// looks it up gets it free and instantly. Documents live at plants/{cropId}.
// Stored: the crop record, lookup keys, and per-zone notes. Not stored: who researched it.
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/backend/firebase";
import { CropSchema, normalizeName } from "@/shared/crop";

const COLLECTION = "plants";

function fromDoc(doc, zone) {
  const data = doc.data();
  const { keys, nameKey, zoneNotes, createdAt, updatedAt, ...rest } = data;
  const result = CropSchema.safeParse({ ...rest, origin: "research", zoneNote: (zone && zoneNotes?.[zone]) || undefined });
  return result.success ? result.data : null;
}

export function createLibrary(database = db()) {
  const col = database.collection(COLLECTION);
  return {
    // Exact match on the plant's name, any saved alias, or its botanical name.
    async findByName(name, zone) {
      const key = normalizeName(name);
      if (!key) return null;
      const snap = await col.where("keys", "array-contains", key).limit(1).get();
      return snap.empty ? null : fromDoc(snap.docs[0], zone);
    },

    // Names starting with the query, for the search box.
    async search(query, limit = 8) {
      const key = normalizeName(query);
      if (!key) return [];
      const snap = await col.where("nameKey", ">=", key).where("nameKey", "<", `${key}\uf8ff`).orderBy("nameKey").limit(limit).get();
      return snap.docs.map((d) => fromDoc(d)).filter(Boolean);
    },

    // Adds a researched plant, or adds this zone's note to one that's already there.
    async save(crop, zone, aliases = []) {
      const { zoneNote, origin, ...record } = crop;
      const keys = [...new Set([crop.name, crop.botanical, crop.id, ...aliases].map(normalizeName).filter(Boolean))];
      const ref = col.doc(crop.id);
      await database.runTransaction(async (tx) => {
        const existing = await tx.get(ref);
        if (existing.exists) {
          tx.update(ref, {
            keys: FieldValue.arrayUnion(...keys),
            ...(zoneNote ? { [`zoneNotes.${zone}`]: zoneNote } : {}),
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          tx.set(ref, {
            ...record,
            nameKey: normalizeName(crop.name),
            keys,
            zoneNotes: zoneNote ? { [zone]: zoneNote } : {},
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      });
    },
  };
}
