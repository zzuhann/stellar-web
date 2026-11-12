import { beforeEach, describe, expect, it, vi } from 'vitest';
import { artistsApi, eventsApi, venueApi } from '@/lib/api';
import sitemap from './sitemap';

vi.mock('@/lib/api', () => ({
  artistsApi: { getAll: vi.fn() },
  eventsApi: { getAll: vi.fn() },
  venueApi: { getVenues: vi.fn() },
}));

const BASE_URL = 'https://www.stellar-zone.com';
const ts = '2026-01-01T00:00:00.000Z';

beforeEach(() => {
  vi.mocked(eventsApi.getAll).mockResolvedValue({ events: [] } as never);
  vi.mocked(venueApi.getVenues).mockResolvedValue({ venues: [] } as never);
});

describe('sitemap', () => {
  // TC-025
  it('lists the overview url next to every artist map url, falling back to id', async () => {
    vi.mocked(artistsApi.getAll).mockResolvedValue([
      { id: 'a1', slug: 'rm', updatedAt: ts },
      { id: 'b9', slug: null, updatedAt: ts },
    ] as never);

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain(`${BASE_URL}/map/rm`);
    expect(urls).toContain(`${BASE_URL}/map/rm/overview`);
    expect(urls).toContain(`${BASE_URL}/map/b9`);
    expect(urls).toContain(`${BASE_URL}/map/b9/overview`);
    expect(urls.filter((u) => /null|undefined/.test(u))).toHaveLength(0);
    // Regression: map pages are still one entry per artist
    expect(urls.filter((u) => /\/map\/[^/]+$/.test(u))).toHaveLength(2);
  });

  // TC-026
  it('falls back to static routes only, with no overview url, when fetching fails', async () => {
    vi.mocked(artistsApi.getAll).mockRejectedValue(new Error('boom'));

    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toContain(BASE_URL);
    expect(urls.some((u) => u.includes('/overview'))).toBe(false);
    expect(urls.some((u) => u.includes('/map/'))).toBe(false);
  });
});
