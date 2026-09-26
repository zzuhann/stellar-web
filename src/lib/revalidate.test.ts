import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { revalidatePublicPages } from './revalidate';

describe('revalidatePublicPages', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('呼叫 /api/revalidate', () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));

    revalidatePublicPages();

    expect(fetch).toHaveBeenCalledWith('/api/revalidate', { method: 'POST' });
  });

  it('fetch reject 時不 throw，也不產生 unhandled rejection', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('network error'));

    expect(() => revalidatePublicPages()).not.toThrow();

    // fire-and-forget：等待內部 promise chain 跑完，確認沒有未被 catch 的 rejection
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});
