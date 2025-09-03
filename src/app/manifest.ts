import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'STELLAR 台灣生日應援地圖',
    short_name: 'STELLAR',
    description: '在 STELLAR 尋找在你附近的生日應援吧！',
    start_url: '/?source=pwa',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#5A7D9A',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['entertainment', 'lifestyle', 'k-pop'],
    lang: 'zh-TW',
    scope: '/',
  };
}
