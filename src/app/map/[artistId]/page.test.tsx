import type { ReactElement, ReactNode } from 'react';
import { HydrationBoundary } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { artistsApi, eventsApi } from '@/lib/api';
import { artistA, e1 } from '@/components/map/overview/testFixtures';
import MapPage from './page';

vi.mock('@/lib/api', () => ({
  artistsApi: { getById: vi.fn() },
  eventsApi: { getMapData: vi.fn() },
}));
vi.mock('next/navigation', () => ({ notFound: vi.fn(), permanentRedirect: vi.fn() }));
vi.mock('@/components/map/MapPage', () => ({ default: () => null }));

function findBoundary(
  node: ReactNode
): ReactElement<{ state: { queries: Array<{ queryKey: unknown }> } }> | null {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const hit = findBoundary(child);
      if (hit) return hit;
    }
    return null;
  }
  const el = node as ReactElement<{ children?: ReactNode; state: never }>;
  if (el.type === HydrationBoundary) return el as never;
  return findBoundary(el.props?.children);
}

describe('map page prefetch', () => {
  // TC-022 (d)
  it('uses the same map-data key as the overview page', async () => {
    vi.mocked(artistsApi.getById).mockResolvedValue(artistA as never);
    vi.mocked(eventsApi.getMapData).mockResolvedValue({ events: [e1], total: 1 });

    const tree = await MapPage({ params: Promise.resolve({ artistId: 'rm' }) });
    const keys = (findBoundary(tree)?.props.state.queries ?? []).map((q) => q.queryKey);

    expect(keys).toContainEqual(['map-data', { status: 'all', search: '', artistId: 'a1' }]);
  });
});
