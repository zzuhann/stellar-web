import type { Artist, MapEvent } from '@/types';

export const artistA: Artist = {
  id: 'a1',
  slug: 'rm',
  stageName: 'RM',
  status: 'approved',
  createdBy: 'u1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const makeEvent = (
  overrides: Partial<Omit<MapEvent, 'slug'>> & { slug?: string | null }
): MapEvent =>
  ({
    id: 'ev',
    title: 't',
    mainImage: 'https://img.test/a.jpg',
    location: { address: '台北市', coordinates: { lat: 25, lng: 121 }, name: 'S' },
    datetime: { start: '2026-11-19T16:00:00.000Z', end: '2026-11-23T16:00:00.000Z' },
    ...overrides,
  }) as MapEvent;

// E1 11/20-11/24 (Taipei), E2 single day 11/25, E3 10/10-12/31 sharing venue S1 with E1
export const e1 = makeEvent({
  id: 'ev-1',
  slug: 'e-1',
  title: '甲',
  mainImage: 'https://img.test/e1.jpg',
  location: {
    address: '台北市',
    city: '臺北市',
    coordinates: { lat: 25, lng: 121 },
    name: 'S1',
  },
});
export const e2 = makeEvent({
  id: 'ev-2',
  slug: 'e-2',
  title: '乙',
  location: { address: '台北市', coordinates: { lat: 25, lng: 121 }, name: 'S2' },
  datetime: { start: '2026-11-24T16:00:00.000Z', end: '2026-11-24T18:00:00.000Z' },
});
export const e3 = makeEvent({
  id: 'ev-3',
  slug: 'e-3',
  title: '丙',
  location: { address: '台北市', coordinates: { lat: 25, lng: 121 }, name: 'S1' },
  datetime: { start: '2026-10-09T16:00:00.000Z', end: '2026-12-30T16:00:00.000Z' },
});

export { makeEvent };
