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
  rewrites: async () => {
    return [
      {
        source: '/((?!api/).*)',
        destination: '/static',
      },
    ];
  },
};

export default nextConfig;
