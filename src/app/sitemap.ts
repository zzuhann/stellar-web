import type { MetadataRoute } from 'next';
import { artistsApi, eventsApi } from '@/lib/api';
import type { FirebaseTimestamp } from '@/types';

export const revalidate = 3600;

const BASE_URL = 'https://www.stellar-zone.com';

function tsToDate(ts: FirebaseTimestamp | string): Date {
  if (typeof ts === 'string') return new Date(ts);
  return new Date(ts._seconds * 1000);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/map`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/submit-event`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/submit-artist`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  try {
    const [artists, eventsResponse] = await Promise.all([
      artistsApi.getAll({ status: 'approved' }),
      eventsApi.getAll({ status: 'approved', limit: 1000 }),
    ]);

    const artistRoutes: MetadataRoute.Sitemap = artists.map((artist) => ({
      url: `${BASE_URL}/map/${artist.id}`,
      lastModified: tsToDate(artist.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const events = eventsResponse?.events ?? [];
    const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
      url: `${BASE_URL}/event/${event.id}`,
      lastModified: tsToDate(event.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...artistRoutes, ...eventRoutes];
  } catch {
    return staticRoutes;
  }
}
