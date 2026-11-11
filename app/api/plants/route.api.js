// Thin route file: the logic lives in backend/. The .api.js ending keeps it out of the offline static build.
export { searchPlants as GET } from "@/backend/handlers/plants";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
