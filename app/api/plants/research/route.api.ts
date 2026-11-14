// Thin route file: the logic lives in backend/. The .api.ts ending keeps it out of the offline static build.
export { researchPlantRoute as POST } from "@/backend/handlers/plants";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // research with web search can take a minute or two
