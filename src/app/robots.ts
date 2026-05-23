import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/settings', '/my-favorite', '/my-submissions'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin', '/settings', '/my-favorite', '/my-submissions'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/admin', '/settings', '/my-favorite', '/my-submissions'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/admin', '/settings', '/my-favorite', '/my-submissions'],
      },
      {
        userAgent: 'Googlebot-Extended',
        allow: '/',
        disallow: ['/admin', '/settings', '/my-favorite', '/my-submissions'],
      },
    ],
    sitemap: 'https://www.stellar-zone.com/sitemap.xml',
  };
}
