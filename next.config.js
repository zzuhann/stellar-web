/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: [
      'pub-b7b01bb9cbef44f2bdd3b7b3a5c1b4b7.r2.dev',
      'pub-1ea260dddf7f40e4b473626d08cc1689.r2.dev',
      'cdn.stellar-zone.com',
    ], // R2
    minimumCacheTTL: 1 * 60 * 60 * 24, // 24 hours
  },
};

module.exports = nextConfig;
