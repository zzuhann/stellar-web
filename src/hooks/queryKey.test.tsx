import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import queryKey, { normalizeMapDataOptions } from './queryKey';
import { useMapData } from './useMapData';

const getMapData = vi.fn();
vi.mock('@/lib/api', () => ({
  eventsApi: { getMapData: (...args: unknown[]) => getMapData(...args) },
}));

describe('queryKey.mapData', () => {
  // TC-022 (a)
  it('fills status=all and search="" so server prefetch and client hook share one key', () => {
    expect(queryKey.mapData({ artistId: 'a1' })).toEqual([
      'map-data',
      { status: 'all', search: '', artistId: 'a1' },
    ]);
  });
});

describe('normalizeMapDataOptions', () => {
  // TC-030 (a)
  it('lets the default status win over an explicit undefined', () => {
    expect(normalizeMapDataOptions({ status: undefined, artistId: 'a1' }).status).toBe('all');
  });

  // TC-030 (b)
  it('trims whitespace-only search to an empty string', () => {
    expect(normalizeMapDataOptions({ search: '  ' }).search).toBe('');
  });

  // TC-030 (c)
  it('keeps other filters untouched', () => {
    expect(normalizeMapDataOptions({ region: '台北市', bounds: '1,2,3,4' })).toMatchObject({
      region: '台北市',
      bounds: '1,2,3,4',
    });
  });
});

describe('useMapData', () => {
  // TC-030 (d)
  it('sends the same params to the API as the second item of its query key', async () => {
    getMapData.mockResolvedValue({ events: [], total: 0 });
    const client = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    renderHook(() => useMapData({ artistId: 'a1', region: '台北市', search: ' x ' }), { wrapper });

    await waitFor(() => expect(getMapData).toHaveBeenCalledTimes(1));
    const key = client.getQueryCache().getAll()[0].queryKey;
    expect(getMapData.mock.calls[0][0]).toEqual(key[1]);
  });
});
