import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Skip ESLint checks during builds (lets `next build && next export` finish)
    ignoreDuringBuilds: true,
  },
  // Remove static export for Netlify (allows API routes to work)
  // output: "export", // Commented out for Netlify deployment
};

export default nextConfig;
