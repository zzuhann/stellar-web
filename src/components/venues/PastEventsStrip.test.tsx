import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { VenueEventCard } from '@/types';
import { trackClickEventDetail } from '@/lib/analytics/venues';
import PastEventsStrip from './PastEventsStrip';

vi.mock('@/lib/analytics/venues', () => ({
  trackClickEventDetail: vi.fn(),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: { uid: 'user-1' } }),
}));

const event: VenueEventCard = {
  id: 'event-1',
  title: '生日應援活動',
  artistName: 'WONWOO',
  startDate: '2026-01-01',
  endDate: '2026-01-02',
  coverImage: 'https://example.com/cover.jpg',
  slug: 'wonwoo-birthday',
};

afterEach(cleanup);

describe('PastEventsStrip 過往活動卡片點擊追蹤', () => {
  it('點擊卡片送出 click_event_detail，content_id 為 eventId，且卡片仍導向活動詳情頁', async () => {
    const user = userEvent.setup();
    render(<PastEventsStrip events={[event]} />);

    const card = screen.getByRole('link');

    expect(card.getAttribute('href')).toBe('/event/wonwoo-birthday');

    await user.click(card);

    expect(trackClickEventDetail).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
      eventTimeStatus: null,
    });
  });

  it('中鍵點擊卡片送出 click_event_detail，右鍵點擊不送出', () => {
    render(<PastEventsStrip events={[event]} />);
    const card = screen.getByRole('link');

    fireEvent(card, new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    expect(trackClickEventDetail).toHaveBeenCalledWith({
      userId: 'user-1',
      eventId: 'event-1',
      eventTimeStatus: null,
    });

    vi.mocked(trackClickEventDetail).mockClear();
    fireEvent(card, new MouseEvent('auxclick', { bubbles: true, button: 2 }));
    expect(trackClickEventDetail).not.toHaveBeenCalled();
  });
});

describe('TC-018 活動卡狀態標籤', () => {
  const events: VenueEventCard[] = [
    {
      ...event,
      id: 'e-ongoing',
      title: '進行中的活動',
      startDate: '2026-10-20',
      timeStatus: 'ongoing',
    },
    {
      ...event,
      id: 'e-upcoming',
      title: '即將到來的活動',
      startDate: '2026-10-18',
      timeStatus: 'upcoming',
    },
    {
      ...event,
      id: 'e-ended',
      title: '已結束的活動',
      startDate: '2026-10-01',
      timeStatus: 'ended',
    },
    { ...event, id: 'e-null', title: '沒有狀態的活動', startDate: '2026-09-01', timeStatus: null },
  ];

  it('只有前兩筆分別顯示「進行中」「即將到來」，排序維持輸入順序', () => {
    render(<PastEventsStrip events={events} />);
    const cards = screen.getAllByRole('listitem');
    expect(cards.map((c) => c.querySelector('h3')?.textContent)).toEqual([
      '進行中的活動',
      '即將到來的活動',
      '已結束的活動',
      '沒有狀態的活動',
    ]);
    expect(within(cards[0]).getByText('進行中')).toBeTruthy();
    expect(within(cards[1]).getByText('即將到來')).toBeTruthy();
    expect(screen.getAllByText(/^(進行中|即將到來)$/)).toHaveLength(2);
  });

  it('點擊帶該活動的 timeStatus（ongoing／upcoming／ended；沒有狀態送 null，GA helper 轉成空字串）', async () => {
    const user = userEvent.setup();
    render(<PastEventsStrip events={events} />);
    for (const card of screen.getAllByRole('link')) await user.click(card);
    expect(
      vi.mocked(trackClickEventDetail).mock.calls.map(([p]) => [p.eventId, p.eventTimeStatus])
    ).toEqual([
      ['e-ongoing', 'ongoing'],
      ['e-upcoming', 'upcoming'],
      ['e-ended', 'ended'],
      ['e-null', null],
    ]);
  });
});

describe('PastEventsStrip 只有放不下時才顯示捲動提示', () => {
  // jsdom has no layout: each card is 180px + 10px gap after 16px padding; the track is `width` wide
  const layout = (width: number) => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement
    ) {
      const items = Array.from(this.parentElement?.querySelectorAll('[role="listitem"]') ?? []);
      const index = items.indexOf(this);
      const right = index === -1 ? 0 : 16 + index * 190 + 180;
      return { left: 0, right } as DOMRect;
    });
  };
  const events = [1, 2, 3].map((n) => ({ ...event, id: `event-${n}` }));
  const hint = () => screen.getByText('← 左右滑動瀏覽全部 →');

  afterEach(() => vi.restoreAllMocks());

  it('3 張都放得下（含右側留白與 spacer）→ 計數、提示、進度條都不顯示', () => {
    layout(16 + 3 * 190 - 10 + 1);
    render(<PastEventsStrip events={events} />);

    expect(screen.queryByText('/')).toBeNull();
    expect(hint().style.visibility).toBe('hidden');
  });

  it('放不下 → 顯示「1 / 3」與提示', () => {
    layout(400);
    render(<PastEventsStrip events={events} />);

    expect(screen.getByText('/')).toBeTruthy();
    expect(hint().style.visibility).toBe('visible');
  });
});
