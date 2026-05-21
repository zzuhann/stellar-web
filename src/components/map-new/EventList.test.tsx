import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EventList from './EventList';
import type { MapEvent } from '@/types';

// ─── Mocks ───────────────────────────────────────────────────
vi.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}));

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

// ─── Fixtures ────────────────────────────────────────────────
const makeEvent = (overrides?: Partial<MapEvent>): MapEvent => ({
  id: 'event-1',
  title: '台北測試活動',
  mainImage: '',
  location: {
    address: '台北市中正區重慶南路一段 1 號',
    coordinates: { lat: 25.0478, lng: 121.5171 },
    name: '測試咖啡廳',
    city: '台北市',
  },
  datetime: {
    start: '2026-06-01T10:00:00Z',
    end: '2026-06-02T18:00:00Z',
  },
  slug: 'test-taipei-event',
  ...overrides,
});

const taichungEvent = makeEvent({
  id: 'event-2',
  title: '台中測試活動',
  slug: 'test-taichung-event',
  location: {
    address: '台中市西區台灣大道二段 2 號',
    coordinates: { lat: 24.1477, lng: 120.6736 },
    name: '台中咖啡廳',
    city: '台中市',
  },
});

const kaohsiungEvent = makeEvent({
  id: 'event-3',
  title: '高雄測試活動',
  slug: 'test-kaohsiung-event',
  location: {
    address: '高雄市前金區中正四路 211 號',
    coordinates: { lat: 22.6271, lng: 120.3014 },
    name: '高雄咖啡廳',
    city: '高雄市',
  },
});

const defaultProps = {
  artistId: 'test-artist',
  onBackToMap: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(cleanup);

// ─────────────────────────────────────────────────────────────
// TC-033：EventList 本身無活動（防禦性 fallback）
// ─────────────────────────────────────────────────────────────
describe('TC-033：零活動防禦性空狀態', () => {
  it('events 為空陣列時顯示防禦性空狀態 icon + 文字', () => {
    render(<EventList events={[]} {...defaultProps} />);

    expect(screen.getByText('目前沒有生日應援活動')).toBeTruthy();
    expect(screen.getByText(/等活動上架後再來看看吧/)).toBeTruthy();
  });

  it('零活動空狀態仍顯示「地圖」按鈕', () => {
    render(<EventList events={[]} {...defaultProps} />);

    expect(screen.getByRole('button', { name: '地圖' })).toBeTruthy();
  });

  it('點擊「地圖」應呼叫 onBackToMap', () => {
    const onBackToMap = vi.fn();
    render(<EventList events={[]} artistId="test-artist" onBackToMap={onBackToMap} />);

    fireEvent.click(screen.getByRole('button', { name: '地圖' }));
    expect(onBackToMap).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────────────────────
// TC-022：city filter — 城市只有 1 個時不顯示城市 chips
// ─────────────────────────────────────────────────────────────
describe('TC-022：單一城市不顯示城市 chips', () => {
  it('所有活動同一城市時，不渲染城市 chip', () => {
    const events = [
      makeEvent({ id: 'e1' }),
      makeEvent({ id: 'e2', title: '台北第二活動', slug: 'e2' }),
    ];
    render(<EventList events={events} {...defaultProps} />);

    expect(screen.queryByRole('button', { name: '全部' })).toBeNull();
    expect(screen.queryByRole('button', { name: '台北市' })).toBeNull();
  });

  it('超過 1 個城市時，顯示城市 chips（含「全部」）', () => {
    const events = [makeEvent(), taichungEvent];
    render(<EventList events={events} {...defaultProps} />);

    expect(screen.getByRole('button', { name: '全部' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '台北市' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '台中市' })).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
// TC-023：city filter — selectedCity 在 events 改變後自動失效
// ─────────────────────────────────────────────────────────────
describe('TC-023：selectedCity 自動失效（derived state）', () => {
  it('選取的城市在目前 events 中不存在時，activeCity 應為 null（顯示全部活動）', () => {
    const { rerender } = render(
      <EventList events={[makeEvent(), taichungEvent, kaohsiungEvent]} {...defaultProps} />
    );

    // 選取台中市
    fireEvent.click(screen.getByRole('button', { name: '台中市' }));
    expect(screen.getByText('台中測試活動')).toBeTruthy();
    expect(screen.queryByText('台北測試活動')).toBeNull();

    // Re-render：只剩台北市 events → 台中市不在 cities → activeCity 自動變 null
    rerender(<EventList events={[makeEvent()]} {...defaultProps} />);

    // 應顯示全部（台北）活動
    expect(screen.getByText('台北測試活動')).toBeTruthy();
    // 只剩 1 個城市，不顯示 city chips
    expect(screen.queryByRole('button', { name: '全部' })).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// TC-018：城市 chips 篩選（純前端 filter）
// ─────────────────────────────────────────────────────────────
describe('TC-018：城市 chips 篩選', () => {
  it('點擊城市 chip 後，只顯示該城市的活動', () => {
    const events = [makeEvent(), taichungEvent, kaohsiungEvent];
    render(<EventList events={events} {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: '台中市' }));

    expect(screen.getByText('台中測試活動')).toBeTruthy();
    expect(screen.queryByText('台北測試活動')).toBeNull();
    expect(screen.queryByText('高雄測試活動')).toBeNull();
  });

  it('再次點擊「全部」chip 後，顯示所有活動', () => {
    const events = [makeEvent(), taichungEvent];
    render(<EventList events={events} {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: '台中市' }));
    fireEvent.click(screen.getByRole('button', { name: '全部' }));

    expect(screen.getByText('台北測試活動')).toBeTruthy();
    expect(screen.getByText('台中測試活動')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
// TC-031/032：城市篩選後空狀態 + 清除 CTA
// ─────────────────────────────────────────────────────────────
describe('TC-031/032：城市篩選切換與清除', () => {
  it('選取城市後顯示該城市活動，再點「全部」清除篩選', () => {
    render(<EventList events={[makeEvent(), taichungEvent]} {...defaultProps} />);

    // 選取台中市
    fireEvent.click(screen.getByRole('button', { name: '台中市' }));
    expect(screen.queryByText('台北測試活動')).toBeNull();

    // 清除篩選（點「全部」）
    fireEvent.click(screen.getByRole('button', { name: '全部' }));

    expect(screen.getByText('台北測試活動')).toBeTruthy();
    expect(screen.getByText('台中測試活動')).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
// TC-019：location chip 顯示與清除
// ─────────────────────────────────────────────────────────────
describe('TC-019：列表模式 location chip', () => {
  it('isLocationFiltered=true 時，顯示地點 chip 與清除按鈕', () => {
    const event = makeEvent({
      location: {
        address: '新北市板橋區文化路一段 1 號',
        coordinates: { lat: 25.014, lng: 121.463 },
        name: '板橋 CAFE',
        city: '新北市',
      },
    });
    render(
      <EventList
        events={[event]}
        {...defaultProps}
        isLocationFiltered
        onClearLocationFilter={vi.fn()}
      />
    );

    expect(screen.getAllByText('板橋 CAFE').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: '清除地點篩選' })).toBeTruthy();
  });

  it('點擊地點 chip × 呼叫 onClearLocationFilter', () => {
    const onClearLocationFilter = vi.fn();
    render(
      <EventList
        events={[makeEvent()]}
        {...defaultProps}
        isLocationFiltered
        onClearLocationFilter={onClearLocationFilter}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '清除地點篩選' }));
    expect(onClearLocationFilter).toHaveBeenCalledOnce();
  });

  it('isLocationFiltered=false 時，不顯示地點 chip', () => {
    render(<EventList events={[makeEvent(), taichungEvent]} {...defaultProps} />);
    expect(screen.queryByRole('button', { name: '清除地點篩選' })).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// 卡片點擊導航
// ─────────────────────────────────────────────────────────────
describe('卡片點擊導航', () => {
  it('點擊含 slug 的卡片應導航至 /event/[slug]', () => {
    render(<EventList events={[makeEvent()]} {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    const eventCard = buttons.find((btn) => btn.textContent?.includes('台北測試活動'));
    if (eventCard) fireEvent.click(eventCard);

    expect(mockPush).toHaveBeenCalledWith('/event/test-taipei-event');
  });

  it('slug 不存在時，應導航至 /event/[id]', () => {
    const event = makeEvent({ slug: undefined, id: 'fallback-id' });
    render(<EventList events={[event]} {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    const eventCard = buttons.find((btn) => btn.textContent?.includes('台北測試活動'));
    if (eventCard) fireEvent.click(eventCard);

    expect(mockPush).toHaveBeenCalledWith('/event/fallback-id');
  });
});
