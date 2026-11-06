import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { venueApi } from '@/lib/api';
import { venueTagDictionaryFixture } from '@/test/venueTagDictionary.fixture';
import { useVenueCardTagDictionary } from './useVenueCardTagDictionary';

vi.mock('@/lib/api', () => ({ venueApi: { getTagDictionary: vi.fn() } }));

let queryClient: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  // Global default retry is deliberately generous so the hook's own retry: 0 is what is tested
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: 3, retryDelay: 1 } } });
  vi.mocked(venueApi.getTagDictionary).mockReset();
});

afterEach(() => {
  queryClient.clear();
});

describe('useVenueCardTagDictionary（VL-020、VL-021）', () => {
  it('pending 時 isPending 為 true、dictionary 為 null', () => {
    vi.mocked(venueApi.getTagDictionary).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useVenueCardTagDictionary(), { wrapper });
    expect(result.current).toEqual({ dictionary: null, isPending: true });
  });

  it('成功時回字典、isPending 為 false', async () => {
    vi.mocked(venueApi.getTagDictionary).mockResolvedValue(venueTagDictionaryFixture);
    const { result } = renderHook(() => useVenueCardTagDictionary(), { wrapper });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.dictionary).toBe(venueTagDictionaryFixture);
  });

  it('失敗時不重試（全站預設 retry 3 也不套用），dictionary 為 null、isPending 為 false', async () => {
    vi.mocked(venueApi.getTagDictionary).mockRejectedValue(new Error('timeout'));
    const { result } = renderHook(() => useVenueCardTagDictionary(), { wrapper });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.dictionary).toBeNull();
    expect(venueApi.getTagDictionary).toHaveBeenCalledTimes(1);
  });

  it('請求逾時設 5 秒', async () => {
    vi.mocked(venueApi.getTagDictionary).mockResolvedValue(venueTagDictionaryFixture);
    const { result } = renderHook(() => useVenueCardTagDictionary(), { wrapper });
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(venueApi.getTagDictionary).toHaveBeenCalledWith({ timeout: 5000 });
  });

  it('失敗後重新 mount 不再重抓：立刻是 settled、沒有骨架狀態', async () => {
    vi.mocked(venueApi.getTagDictionary).mockRejectedValue(new Error('timeout'));
    const first = renderHook(() => useVenueCardTagDictionary(), { wrapper });
    await waitFor(() => expect(first.result.current.isPending).toBe(false));
    first.unmount();

    const second = renderHook(() => useVenueCardTagDictionary(), { wrapper });
    expect(second.result.current).toEqual({ dictionary: null, isPending: false });
    expect(venueApi.getTagDictionary).toHaveBeenCalledTimes(1);
  });

  it('離線也照常發請求（networkMode always），並使用卡片專用的 query key', async () => {
    vi.mocked(venueApi.getTagDictionary).mockResolvedValue(venueTagDictionaryFixture);
    const { result } = renderHook(() => useVenueCardTagDictionary(), { wrapper });
    await waitFor(() => expect(result.current.isPending).toBe(false));

    const query = queryClient.getQueryCache().find({ queryKey: ['venue-card-tag-dictionary'] });
    expect(query?.options.networkMode).toBe('always');
    expect(
      queryClient.getQueryCache().find({ queryKey: ['venue-tag-dictionary'] })
    ).toBeUndefined();
  });
});
