import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.abimusaalasyari.my.id',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
