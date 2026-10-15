import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Opened at 127.0.0.1. Next treats that as a different origin from
  // localhost and would block the dev client, leaving the page inert.
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
