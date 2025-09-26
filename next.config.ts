import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // --- ADD THIS WEBPACK CONFIGURATION BLOCK ---
  webpack: (config, { isServer }) => {
    // This rule is specifically for the server-side build (`isServer` is true)
    if (isServer) {
      // Don't bundle `pdfjs-dist` on the server
      config.externals.push('pdfjs-dist');
    }
    return config;
  },
  // --- END OF ADDED BLOCK ---
};

export default nextConfig;