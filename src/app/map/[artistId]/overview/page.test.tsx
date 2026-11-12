import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ReactElement, ReactNode } from 'react';
import { HydrationBoundary } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { artistsApi, eventsApi } from '@/lib/api';
import { notFound, permanentRedirect } from 'next/navigation';
import { artistA, e1 } from '@/components/map/overview/testFixtures';
import OverviewPage, * as pageModule from './page';

vi.mock('@/lib/api', () => ({
  artistsApi: { getById: vi.fn() },
  eventsApi: { getMapData: vi.fn() },
}));

// Real Next.js helpers throw to abort rendering; mimic that so code after them never runs
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  permanentRedirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock('@/components/map/overview/MapOverview', () => ({ default: () => null }));

const params = (artistId: string) => ({ params: Promise.resolve({ artistId }) });

function findElement(node: ReactNode, match: (el: ReactElement) => boolean): ReactElement | null {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const hit = findElement(child, match);
      if (hit) return hit;
    }
    return null;
  }
  const el = node as ReactElement<{ children?: ReactNode }>;
  if (match(el)) return el;
  return findElement(el.props?.children, match);
}

beforeEach(() => {
  vi.mocked(artistsApi.getById).mockResolvedValue(artistA as never);
  vi.mocked(eventsApi.getMapData).mockResolvedValue({ events: [e1], total: 1 });
});

describe('overview page errors', () => {
  // TC-017
  it('calls notFound when the artist does not exist', async () => {
    vi.mocked(artistsApi.getById).mockRejectedValue({ response: { status: 404 } });
    await expect(OverviewPage(params('ghost'))).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  // TC-018
  it('rethrows backend failures instead of swallowing them', async () => {
    vi.mocked(artistsApi.getById).mockRejectedValue({ response: { status: 500 } });
    await expect(OverviewPage(params('rm'))).rejects.toEqual({ response: { status: 500 } });
    expect(notFound).not.toHaveBeenCalled();

    vi.mocked(artistsApi.getById).mockResolvedValue(artistA as never);
    vi.mocked(eventsApi.getMapData).mockRejectedValue(new Error('map-data 500'));
    await expect(OverviewPage(params('rm'))).rejects.toThrow('map-data 500');
    expect(notFound).not.toHaveBeenCalled();
  });
});

describe('overview page redirect', () => {
  // TC-019
  it('permanently redirects an id entry to the slug overview url', async () => {
    await expect(OverviewPage(params('a1'))).rejects.toThrow('NEXT_REDIRECT:/map/rm/overview');
    expect(permanentRedirect).toHaveBeenCalledTimes(1);
    expect(permanentRedirect).toHaveBeenCalledWith('/map/rm/overview');
  });

  // TC-020
  it('does not redirect on a slug entry or when the artist has no slug', async () => {
    await OverviewPage(params('rm'));
    expect(permanentRedirect).not.toHaveBeenCalled();

    vi.mocked(artistsApi.getById).mockResolvedValue({ ...artistA, slug: undefined } as never);
    await OverviewPage(params('a1'));
    expect(permanentRedirect).not.toHaveBeenCalled();
  });
});

describe('overview page metadata', () => {
  // TC-021
  it('points title, canonical and og:url at the overview page and og:image at the map og image', async () => {
    const meta = await pageModule.generateMetadata(params('rm'));

    expect(String(JSON.stringify(meta.title))).toContain('RM 生咖總覽');
    const canonical = meta.alternates?.canonical;
    expect(String(canonical)).toMatch(/\/map\/rm\/overview$/);
    expect(meta.openGraph?.url).toBe(canonical);
    const images = meta.openGraph?.images as Array<{ url: string }>;
    expect(images[0].url).toMatch(/\/map\/rm\/opengraph-image$/);
  });
});

describe('overview page data and ISR', () => {
  // TC-022 (b)
  it('prefetches the shared map-data key into HydrationBoundary', async () => {
    const tree = await OverviewPage(params('rm'));
    const boundary = findElement(tree, (el) => el.type === HydrationBoundary) as ReactElement<{
      state: { queries: Array<{ queryKey: unknown }> };
    }> | null;
    expect(boundary).not.toBeNull();
    const keys = (boundary?.props.state.queries ?? []).map((q) => q.queryKey);
    expect(keys).toContainEqual(['map-data', { status: 'all', search: '', artistId: 'a1' }]);
  });

  // TC-023
  it('is ISR and never reads request search params', async () => {
    expect(Number.isInteger(pageModule.revalidate)).toBe(true);
    expect(pageModule.revalidate).toBeGreaterThan(0);
    expect(await pageModule.generateStaticParams()).toEqual([]);
    expect((pageModule as Record<string, unknown>).dynamic).toBeUndefined();

    const source = readFileSync(path.join(__dirname, 'page.tsx'), 'utf8');
    expect(source).not.toContain('searchParams');
    expect(source).not.toContain('useSearchParams');
    expect(source).not.toContain('force-dynamic');
  });
});
