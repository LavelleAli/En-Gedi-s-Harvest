// GET  /api/plants?q=okr        search the shared plant library (public, cached at the CDN)
// POST /api/plants/research     { name, zone } -> a crop record; signed-in users only
import { clientIp, json, parseOr400, rateLimit, readJson, route } from "@/backend/http";
import { SearchInput } from "@/backend/plants/service";
import { requireUser } from "@/backend/firebase";
import { plantService } from "@/backend/handlers/deps";

export const searchPlants = route("plants.search", async (req, { requestId }) => {
  rateLimit(`search:${clientIp(req)}`, 60, 60_000);
  const { q } = parseOr400(SearchInput, { q: new URL(req.url).searchParams.get("q") || "" });
  const results = await plantService().search(q);
  // Public data that changes rarely: let the CDN keep it for 5 minutes.
  return json({ results }, { requestId, headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" } });
});

export const researchPlantRoute = route("plants.research", async (req, { requestId }) => {
  rateLimit(`research-ip:${clientIp(req)}`, 10, 60_000);
  const user = await requireUser(req);
  rateLimit(`research:${user.uid}`, 4, 60_000);
  const body = await readJson(req);
  const result = await plantService().lookup(user.uid, body);
  return json(result, { requestId });
});
