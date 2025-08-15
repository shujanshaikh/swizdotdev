import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['lh3.googleusercontent.com', 'firecrawl.com', 'service.firecrawl.dev'],
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
