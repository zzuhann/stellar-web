import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRandomVenuesQuery } from '@/hooks/useHomePage';
import {
  trackClickHomeVenueDetail,
  trackClickVenueListCta,
  trackViewHomeVenueCard,
} from '@/lib/analytics/venues';
import HomeVenuesSection from './HomeVenuesSection';

vi.mock('@/hooks/useHomePage', () => ({ useRandomVenuesQuery: vi.fn() }));
vi.mock('@/lib/analytics/venues', () => ({
  trackClickHomeVenueDetail: vi.fn(),
  trackClickVenueListCta: vi.fn(),
  trackViewHomeVenueCard: vi.fn(),
}));

const venue = {
  id: 'venue-1',
  name: '測試場地',
  address: '台北市測試路 1 號',
  region: '台北',
  lat: 25,
  lng: 121,
  capacityRange: '20-40' as const,
  eventCount: 3,
  coverPhoto: 'https://example.com/cover.jpg',
  otherPhotos: ['https://example.com/other.jpg'],
  status: 'active' as const,
};

beforeEach(() => {
  sessionStorage.clear();
  vi.mocked(useRandomVenuesQuery).mockReturnValue({
    data: [venue],
    isPending: false,
    isError: false,
  } as ReturnType<typeof useRandomVenuesQuery>);

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      private callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      observe() {
        this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this);
      }
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = '';
      thresholds = [];
    }
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('HomeVenuesSection', () => {
  it('載入中顯示 skeleton 與查看全部入口', () => {
    vi.mocked(useRandomVenuesQuery).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
    } as ReturnType<typeof useRandomVenuesQuery>);

    render(<HomeVenuesSection />);

    expect(screen.getByRole('status', { name: '場地載入中' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '查看全部場地' }).getAttribute('href')).toBe('/venues');
  });

  it('只呈現封面與精簡場地資訊', () => {
    render(<HomeVenuesSection />);

    expect(screen.getByRole('heading', { name: '探索生咖場地' })).toBeTruthy();
    expect(screen.getByRole('img', { name: '測試場地場地照片' }).getAttribute('src')).toContain(
      'cover.jpg'
    );
    expect(screen.queryByText('other.jpg')).toBeNull();
    expect(screen.getByText('20-40人')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText(/場生日應援紀錄/)).toBeTruthy();
  });

  it('追蹤首頁卡片曝光、卡片點擊與查看全部點擊', async () => {
    const user = userEvent.setup();
    render(<HomeVenuesSection />);

    expect(trackViewHomeVenueCard).toHaveBeenCalledWith({
      venueId: 'venue-1',
      venueRegion: '台北',
      listPosition: 1,
    });

    await user.click(screen.getByRole('link', { name: /測試場地/ }));
    expect(trackClickHomeVenueDetail).toHaveBeenCalledWith({
      venueId: 'venue-1',
      venueRegion: '台北',
      listPosition: 1,
    });
    expect(sessionStorage.getItem('venues_scrollY')).toBeNull();

    await user.click(screen.getByRole('link', { name: '查看全部場地' }));
    expect(trackClickVenueListCta).toHaveBeenCalledOnce();
  });

  it('API 失敗時整個區塊不渲染（含標題與查看全部）', () => {
    vi.mocked(useRandomVenuesQuery).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    } as ReturnType<typeof useRandomVenuesQuery>);

    const { container } = render(<HomeVenuesSection />);

    expect(container.firstChild).toBeNull();
  });

  it('回傳空清單時整個區塊不渲染', () => {
    vi.mocked(useRandomVenuesQuery).mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    } as unknown as ReturnType<typeof useRandomVenuesQuery>);

    const { container } = render(<HomeVenuesSection />);

    expect(container.firstChild).toBeNull();
  });
});
