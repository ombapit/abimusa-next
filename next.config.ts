import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // 🔥 ini kunci penting

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
