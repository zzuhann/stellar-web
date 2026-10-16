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

    const card = screen.getByRole('listitem');

    expect(card.getAttribute('href')).toBe('/event/wonwoo-birthday');

    await user.click(card);

    expect(trackClickEventDetail).toHaveBeenCalledWith({ userId: 'user-1', eventId: 'event-1' });
  });

  it('中鍵點擊卡片送出 click_event_detail，右鍵點擊不送出', () => {
    render(<PastEventsStrip events={[event]} />);
    const card = screen.getByRole('listitem');

    fireEvent(card, new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    expect(trackClickEventDetail).toHaveBeenCalledWith({ userId: 'user-1', eventId: 'event-1' });

    vi.mocked(trackClickEventDetail).mockClear();
    fireEvent(card, new MouseEvent('auxclick', { bubbles: true, button: 2 }));
    expect(trackClickEventDetail).not.toHaveBeenCalled();
  });
});

describe('TC-018 活動卡狀態標籤（新版詳情才開，opt-in）', () => {
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

  it('showTimeStatus：只有前兩筆分別顯示「進行中」「即將到來」，排序維持輸入順序', () => {
    render(<PastEventsStrip events={events} showTimeStatus />);
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

  it('預設（正式頁）不顯示狀態標籤', () => {
    render(<PastEventsStrip events={events} />);
    expect(screen.queryAllByText(/^(進行中|即將到來)$/)).toHaveLength(0);
  });

  it('trackClicks={false}：點擊與中鍵都不送 click_event_detail', async () => {
    const user = userEvent.setup();
    render(<PastEventsStrip events={[event]} trackClicks={false} />);
    const card = screen.getByRole('listitem');
    await user.click(card);
    fireEvent(card, new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    expect(trackClickEventDetail).not.toHaveBeenCalled();
  });
});
