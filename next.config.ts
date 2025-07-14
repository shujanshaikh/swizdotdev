import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
