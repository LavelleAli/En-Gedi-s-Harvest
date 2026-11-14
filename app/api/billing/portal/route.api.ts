// Thin route file: the logic lives in backend/. The .api.ts ending keeps it out of the offline static build.
export { portal as POST } from "@/backend/handlers/billing";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
