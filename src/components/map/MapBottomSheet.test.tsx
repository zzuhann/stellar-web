import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MapBottomSheet from './MapBottomSheet';
import { MapEvent } from '@/types';

// jsdom lacks ResizeObserver / matchMedia; stub them since only share-button behavior is under test here.
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

// Stub EventCarousel: its own heavy deps (next/image, EventCarouselCard) are irrelevant here.
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

  it('滑鼠完整序列（mouseDown → mouseUp → click）點分享，不觸發 bottom sheet 展開／收合，且高度不變', () => {
    render(<MapBottomSheet artistId="wonwoo" events={[baseEvent]} />);
    const sheetInner = screen.getByTestId('bottom-sheet').firstElementChild as HTMLElement;
    const transformBefore = sheetInner.style.transform;

    const shareButton = screen.getByRole('button', { name: '分享' });
    fireEvent.mouseDown(shareButton);
    fireEvent.mouseUp(shareButton);
    fireEvent.click(shareButton);

    expect(share).toHaveBeenCalledWith(shareData);
    expect(sendGAEvent).not.toHaveBeenCalledWith(
      'event',
      'map_bottom_sheet_expand',
      expect.anything()
    );
    expect(sheetInner.style.transform).toBe(transformBefore);
  });
});

describe('MapBottomSheet 手勢排除（data-sheet-no-drag）', () => {
  beforeEach(() => {
    sendGAEvent.mockClear();
    share.mockClear();
  });

  it('原生 touchstart 打在把手空白處會呼叫 preventDefault（drag 正常啟動，作為對照組）', () => {
    render(<MapBottomSheet artistId="wonwoo" events={[baseEvent]} />);
    const handleBarArea = screen.getByTestId('handle-bar-area');

    // fireEvent's return value mirrors element.dispatchEvent: false means preventDefault() was called.
    const notPrevented = fireEvent.touchStart(handleBarArea, { touches: [{ clientY: 300 }] });

    expect(notPrevented).toBe(false);
    fireEvent.touchEnd(handleBarArea);
  });

  it('原生 touchstart/touchend 打在分享 pill 上不會呼叫 preventDefault，也不會啟動拖曳，click 仍能觸發分享', () => {
    render(<MapBottomSheet artistId="wonwoo" events={[baseEvent]} />);
    const sheetInner = screen.getByTestId('bottom-sheet').firstElementChild as HTMLElement;
    const transformBefore = sheetInner.style.transform;
    const shareButton = screen.getByRole('button', { name: '分享' });

    const notPrevented = fireEvent.touchStart(shareButton, { touches: [{ clientY: 300 }] });
    expect(notPrevented).toBe(true);
    fireEvent.touchEnd(shareButton);
    // jsdom doesn't synthesize a click from touch events like real browsers do, so fire it explicitly here.
    fireEvent.click(shareButton);

    expect(share).toHaveBeenCalledWith(shareData);
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'share_event', expect.anything());
    expect(sendGAEvent).not.toHaveBeenCalledWith(
      'event',
      'map_bottom_sheet_expand',
      expect.anything()
    );
    expect(sheetInner.style.transform).toBe(transformBefore);
  });

  it('location chip 的既有排除行為沒有壞掉：touchstart 不會 preventDefault，清除按鈕仍可點擊', () => {
    const onClearLocationFilter = vi.fn();
    render(
      <MapBottomSheet
        artistId="wonwoo"
        events={[baseEvent]}
        isLocationFiltered
        onClearLocationFilter={onClearLocationFilter}
      />
    );

    const clearButton = screen.getByRole('button', { name: '清除地點篩選' });
    const notPrevented = fireEvent.touchStart(clearButton, { touches: [{ clientY: 300 }] });
    expect(notPrevented).toBe(true);
    fireEvent.touchEnd(clearButton);
    fireEvent.click(clearButton);

    expect(onClearLocationFilter).toHaveBeenCalledTimes(1);
  });
});
