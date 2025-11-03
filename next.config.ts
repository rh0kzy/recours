import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignore des warnings sur les <img> qui ne sont que des recommandations
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
