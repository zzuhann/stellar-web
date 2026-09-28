import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePageView } from './usePageView';
import { useAuth } from '@/lib/auth-context';

const sendGAEvent = vi.fn();
vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: (...args: unknown[]) => sendGAEvent(...args),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: vi.fn(),
}));

afterEach(() => {
  sendGAEvent.mockClear();
  vi.mocked(useAuth).mockReset();
});

describe('usePageView', () => {
  it('contentId 從 A 換到 B 時各送出一次 page_view', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>);
    const { rerender } = renderHook(
      ({ contentId }: { contentId: string }) =>
        usePageView({ eventPage: '/map/[artistId]', contentId }),
      { initialProps: { contentId: 'artist-A' } }
    );

    expect(sendGAEvent).toHaveBeenCalledTimes(1);
    expect(sendGAEvent).toHaveBeenNthCalledWith(1, 'event', 'page_view', {
      event_page: '/map/[artistId]',
      user_id: '',
      content_id: 'artist-A',
    });

    rerender({ contentId: 'artist-B' });

    expect(sendGAEvent).toHaveBeenCalledTimes(2);
    expect(sendGAEvent).toHaveBeenNthCalledWith(2, 'event', 'page_view', {
      event_page: '/map/[artistId]',
      user_id: '',
      content_id: 'artist-B',
    });
  });

  it('同一個 contentId 重新 render 時只送出 1 次', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>);
    const { rerender } = renderHook(
      ({ contentId }: { contentId: string }) =>
        usePageView({ eventPage: '/map/[artistId]', contentId }),
      { initialProps: { contentId: 'artist-A' } }
    );

    rerender({ contentId: 'artist-A' });
    rerender({ contentId: 'artist-A' });

    expect(sendGAEvent).toHaveBeenCalledTimes(1);
  });

  it('只有 auth 的 user 改變時不重送 page_view', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null } as ReturnType<typeof useAuth>);
    const { rerender } = renderHook(
      () => usePageView({ eventPage: '/map/[artistId]', contentId: 'artist-A' }),
      { initialProps: {} }
    );

    expect(sendGAEvent).toHaveBeenCalledTimes(1);

    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'user-1' },
    } as ReturnType<typeof useAuth>);
    rerender({});

    expect(sendGAEvent).toHaveBeenCalledTimes(1);
  });
});
