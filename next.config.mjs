// Two builds from one codebase:
// - Default (Vercel, `npm run dev`): a normal Next.js app, so the plant-lookup API route
//   (app/api/plant-lookup/route.api.js) runs as a serverless function.
// - STATIC_EXPORT=1 (`npm run offline`, end-to-end tests): a plain static site in /out that runs
//   offline. Route files ending in .api.js aren't picked up, so the export has no server code,
//   and the app shows a "lookup needs the online version" message instead.
const isStatic = process.env.STATIC_EXPORT === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isStatic ? "export" : undefined,
  pageExtensions: isStatic ? ["js"] : ["js", "api.js"],
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
