import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MapPage from './MapPage';

const sendGAEvent = vi.fn();
vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: (...args: unknown[]) => sendGAEvent(...args),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: { uid: 'user-1' } }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

// next/dynamic wraps MapSection with a real leaflet map; irrelevant to page_view tracking, stub it out entirely.
vi.mock('next/dynamic', () => ({
  default: () => () => null,
}));

vi.mock('./MapBottomSheet', () => ({ default: () => null }));
vi.mock('./MapSingleEventCard', () => ({ default: () => null }));

vi.mock('./hooks/useMapNewLocation', () => ({
  default: () => ({ latitude: null, longitude: null }),
}));

vi.mock('./hooks/useMapStateStorage', () => ({
  useMapStateStorage: () => ({ saveState: vi.fn(), consumeRestoredState: () => null }),
}));

vi.mock('@/components/map/hook/useMapPageData', () => ({
  default: vi.fn(() => ({
    mapEvents: [],
    isMapLoading: false,
    artistData: { id: 'artist-1', stageName: 'WONWOO', stageNameZh: '원우' },
    isArtistLoading: false,
  })),
}));

afterEach(cleanup);

describe('MapPage page_view 追蹤', () => {
  beforeEach(() => {
    sendGAEvent.mockClear();
  });

  it('artistId 就緒時送出一次帶 event_page 的自訂 page_view，參數正確', () => {
    render(<MapPage artistId="wonwoo" />);

    const pageViewCalls = sendGAEvent.mock.calls.filter(
      ([, eventName]) => eventName === 'page_view'
    );
    expect(pageViewCalls).toHaveLength(1);
    expect(pageViewCalls[0]).toEqual([
      'event',
      'page_view',
      {
        event_page: '/map/[artistId]',
        user_id: 'user-1',
        content_id: 'wonwoo',
      },
    ]);
  });

  it('重新 render 不會重複送出 page_view', () => {
    const { rerender } = render(<MapPage artistId="wonwoo" />);
    rerender(<MapPage artistId="wonwoo" />);

    const pageViewCalls = sendGAEvent.mock.calls.filter(
      ([, eventName]) => eventName === 'page_view'
    );
    expect(pageViewCalls).toHaveLength(1);
  });
});
