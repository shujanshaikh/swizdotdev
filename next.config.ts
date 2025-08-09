import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'owy4v1bujb.ufs.sh',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
