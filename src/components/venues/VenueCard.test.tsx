import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VenueCard from './VenueCard';
import type { Venue } from '@/types';

// jsdom has no IntersectionObserver; VenueCard only uses it for view-tracking, not
// under test here (analytics is mocked out below).
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);

vi.mock('@/lib/analytics/venues', () => ({
  trackViewVenueCard: vi.fn(),
  trackClickVenueDetail: vi.fn(),
}));

afterEach(cleanup);

const BASE_VENUE: Venue = {
  id: 'venue-1',
  name: '測試場地',
  address: '台北市測試路 1 號',
  region: '台北',
  lat: 25.033,
  lng: 121.564,
  nearestMrt: null,
  mrtWalkMinutes: null,
  capacityRange: null,
  eventCount: 0,
  coverPhoto: null,
  status: 'active',
};

// 1km 東邊的台北車站座標附近，實際距離不重要，只需要是個有限、非 0 的距離。
const USER_COORDS = { lat: 25.033, lng: 121.574 };

function renderCard(overrides: Partial<Parameters<typeof VenueCard>[0]> = {}) {
  return render(
    <VenueCard venue={BASE_VENUE} listPosition={1} listSort="composite" {...overrides} />
  );
}

// qa.md 情境 39：VenueCard 距離顯示
describe('VenueCard 距離顯示（venue-distance-sort）', () => {
  it('未授權座標（userCoords 為 null）時，不顯示距離文字', () => {
    renderCard({ userCoords: null });
    expect(screen.queryByText(/公尺|公里/)).toBeNull();
  });

  it('已授權座標且場地有座標時，顯示距離文字', () => {
    renderCard({ userCoords: USER_COORDS });
    expect(screen.getByText(/約|公尺內|公里/)).toBeTruthy();
  });

  it('IAB 環境下，即使已授權座標也不顯示距離文字', () => {
    renderCard({ userCoords: USER_COORDS, isInAppBrowser: true });
    expect(screen.queryByText(/公尺|公里/)).toBeNull();
  });

  it('場地本身缺座標（lat/lng 皆為 0）時，不顯示距離文字', () => {
    renderCard({
      venue: { ...BASE_VENUE, lat: 0, lng: 0 },
      userCoords: USER_COORDS,
    });
    expect(screen.queryByText(/公尺|公里/)).toBeNull();
  });

  it('場地只有一邊座標為 0 時，視為有效座標，照常顯示距離', () => {
    renderCard({
      venue: { ...BASE_VENUE, lat: 0, lng: 121.564 },
      userCoords: USER_COORDS,
    });
    expect(screen.getByText(/約|公尺內|公里/)).toBeTruthy();
  });

  it('距離計算使用傳入的 userCoords（視為已 rounded），而非另外重新取得座標', () => {
    // 刻意讓 userCoords 與 venue 完全同點 → 距離 0 → "100 公尺內"
    renderCard({
      venue: { ...BASE_VENUE, lat: 25.033, lng: 121.564 },
      userCoords: { lat: 25.033, lng: 121.564 },
    });
    expect(screen.getByText(/100 公尺內/)).toBeTruthy();
  });

  describe('捷運×距離四種組合與 sectionDivider', () => {
    it('有捷運+有距離：同排左右呈現，sectionDivider 出現', () => {
      renderCard({
        venue: { ...BASE_VENUE, nearestMrt: '台北車站', mrtWalkMinutes: 5 },
        userCoords: USER_COORDS,
      });
      expect(screen.getByText(/台北車站/)).toBeTruthy();
      expect(screen.getByText(/約|公尺內|公里/)).toBeTruthy();
      expect(screen.queryByTestId('section-divider')).toBeTruthy();
    });

    it('有捷運+無距離：維持現行樣式，只有捷運內容', () => {
      renderCard({
        venue: { ...BASE_VENUE, nearestMrt: '台北車站', mrtWalkMinutes: 5 },
        userCoords: null,
      });
      expect(screen.getByText(/台北車站/)).toBeTruthy();
      expect(screen.queryByText(/公尺|公里/)).toBeNull();
      expect(screen.queryByTestId('section-divider')).toBeTruthy();
    });

    it('無捷運+有距離：這排仍要 render，只有距離，sectionDivider 出現', () => {
      renderCard({
        venue: { ...BASE_VENUE, nearestMrt: null },
        userCoords: USER_COORDS,
      });
      expect(screen.getByText(/約|公尺內|公里/)).toBeTruthy();
      expect(screen.queryByTestId('section-divider')).toBeTruthy();
    });

    it('無捷運+無距離：整排不 render，sectionDivider 不出現（無 hostTags 時）', () => {
      renderCard({
        venue: { ...BASE_VENUE, nearestMrt: null, hostTags: [] },
        userCoords: null,
      });
      expect(screen.queryByText(/公尺|公里/)).toBeNull();
      expect(screen.queryByTestId('section-divider')).toBeNull();
    });
  });

  it('已授權後切到其他排序（listSort 非 distance），只要卡片有座標仍持續顯示距離', () => {
    renderCard({ userCoords: USER_COORDS, listSort: 'newest' });
    expect(screen.getByText(/約|公尺內|公里/)).toBeTruthy();
  });

  it('sr-only 前綴「距離你」接在可見文字前，組成完整 accessible name', () => {
    renderCard({
      venue: { ...BASE_VENUE, lat: 25.033, lng: 121.564 },
      userCoords: { lat: 25.033, lng: 121.564 },
    });

    // 整張卡片是同一個 <Link>，sr-only 前綴併入其 accessible name
    const link = screen.getByRole('link', { name: /距離你\s*100 公尺內/ });
    expect(link).toBeTruthy();
    expect(screen.getByText('距離你')).toBeTruthy();
    // 可見文字本身不變，視覺上仍會 render 出「100 公尺內」
    expect(link.textContent).toContain('100 公尺內');
  });
});
