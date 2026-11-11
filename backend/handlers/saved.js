// GET /api/saved   everything the signed-in reader has synced: { items: { key: { value, updatedAt } } }
// PUT /api/saved   save one key: { key, value, updatedAt } -> { saved, item }
//                  saved is false when the server already had a newer copy; item is that copy.
import { json, rateLimit, readJson, route } from "@/backend/http";
import { requireUser } from "@/backend/firebase";
import { createSavedStore } from "@/backend/saved/store";
import { createSavedService } from "@/backend/saved/service";
import { MAX_VALUE_CHARS } from "@/shared/saved-data";

// Built once per server instance, like the services in handlers/deps.js.
let service;
export function savedService() {
  service ??= createSavedService({ store: createSavedStore() });
  return service;
}

export const getSaved = route("saved.get", async (req, { requestId }) => {
  const user = await requireUser(req);
  rateLimit(`saved:${user.uid}`, 60, 60_000);
  return json({ items: await savedService().list(user.uid) }, { requestId });
});

export const putSaved = route("saved.put", async (req, { requestId }) => {
  const user = await requireUser(req);
  rateLimit(`saved:${user.uid}`, 60, 60_000);
  // The JSON wrapper adds a little on top of the value itself.
  const body = await readJson(req, MAX_VALUE_CHARS + 2048);
  return json(await savedService().save(user.uid, body), { requestId });
});
