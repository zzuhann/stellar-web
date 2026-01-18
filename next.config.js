/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-b7b01bb9cbef44f2bdd3b7b3a5c1b4b7.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'pub-1ea260dddf7f40e4b473626d08cc1689.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'cdn.stellar-zone.com',
      },
    ],
    minimumCacheTTL: 1 * 60 * 60 * 24, // 24 hours
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
