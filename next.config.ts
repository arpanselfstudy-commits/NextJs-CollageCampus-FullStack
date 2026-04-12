import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  compress: true,
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      // catch-all for any other https image host from the API
      { protocol: "https", hostname: "**" },
    ],
  },
  // API routes are now handled internally by Next.js Route Handlers in src/app/api/
  // No proxy rewrites needed — the external Express server has been replaced.
};

export default withBundleAnalyzer(nextConfig);
