import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MapBottomSheet from './MapBottomSheet';
import { MapEvent } from '@/types';

// jsdom doesn't implement ResizeObserver / matchMedia; the component only uses them for
// height measurement and reduced-motion detection, neither of which is under test here.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub);
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
);

const sendGAEvent = vi.fn();
vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: (...args: unknown[]) => sendGAEvent(...args),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: { uid: 'user-1' } }),
}));

const share = vi.fn();
vi.mock('@/hooks/useWebShare', () => ({
  useWebShare: () => ({ share }),
}));

const shareData = { title: 'STELLAR', text: '', url: 'https://stellar-zone.com/map/wonwoo' };
vi.mock('@/context/ShareContext', () => ({
  useShare: () => ({ shareData }),
}));

// EventCarousel has its own heavy deps (next/image, EventCarouselCard); irrelevant to the
// share button behavior under test here, stub it out.
vi.mock('./EventCarousel', () => ({
  default: () => <div data-testid="event-carousel-stub" />,
}));

const baseEvent: MapEvent = {
  id: 'event-1',
  location: {
    address: '台北市',
    coordinates: { lat: 25.03, lng: 121.56 },
    name: '某咖啡廳',
  },
  title: '生日應援活動',
  mainImage: '/image.jpg',
  datetime: { start: '2026-01-01T00:00:00Z', end: '2026-01-01T06:00:00Z' },
};

afterEach(cleanup);

describe('MapBottomSheet 分享按鈕', () => {
  beforeEach(() => {
    sendGAEvent.mockClear();
    share.mockClear();
  });

  it('點擊分享按鈕會呼叫 share() 並送出帶 map_bottom_sheet 的 GA 事件', () => {
    render(<MapBottomSheet artistId="wonwoo" events={[baseEvent]} />);

    fireEvent.click(screen.getByRole('button', { name: '分享' }));

    expect(share).toHaveBeenCalledWith(shareData);
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'share_event', {
      event_page: '/map/[artistId]',
      user_id: 'user-1',
      content_id: 'wonwoo',
      button_location: 'map_bottom_sheet',
    });
  });

  it('點擊分享按鈕不會觸發 bottom sheet 展開／收合（不送出 map_bottom_sheet_expand 事件）', () => {
    render(<MapBottomSheet artistId="wonwoo" events={[baseEvent]} />);

    const shareButton = screen.getByRole('button', { name: '分享' });
    fireEvent.mouseDown(shareButton);
    fireEvent.click(shareButton);

    expect(sendGAEvent).not.toHaveBeenCalledWith(
      'event',
      'map_bottom_sheet_expand',
      expect.anything()
    );
  });
});
