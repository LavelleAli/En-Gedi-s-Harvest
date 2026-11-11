// Thin route file: the logic lives in backend/. The .api.js ending keeps it out of the offline static build.
export { getAccount as GET, deleteAccount as DELETE } from "@/backend/handlers/account";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
