// Two builds from one codebase:
// - Default (Vercel, `npm run dev`): a normal Next.js app, so the API routes
//   (app/api/**/route.api.ts) run as serverless functions.
// - STATIC_EXPORT=1 (`npm run offline`, end-to-end tests): a plain static site in /out that runs
//   offline. Route files ending in .api.ts aren't picked up, so the export has no server code,
//   and the app shows a "lookup needs the online version" message instead.
import type { NextConfig } from "next";

const isStatic = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  output: isStatic ? "export" : undefined,
  pageExtensions: isStatic ? ["tsx", "ts"] : ["tsx", "ts", "api.ts"],
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
