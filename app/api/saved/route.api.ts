// Thin route file: the logic lives in backend/. The .api.ts ending keeps it out of the offline static build.
export { getSaved as GET, putSaved as PUT } from "@/backend/handlers/saved";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
