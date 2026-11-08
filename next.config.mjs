/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: `npm run build` writes a plain website to /out that runs offline.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
