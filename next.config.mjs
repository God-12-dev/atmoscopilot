/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "openweathermap.org" }],
  },
  // Don't fail the build if Prisma engine binaries are not available (sandbox/CI)
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
  // Route handlers that use Prisma are dynamic - skip static generation
  output: "standalone",
};
export default nextConfig;
