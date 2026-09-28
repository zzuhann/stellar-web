import { cleanup, render, screen } from '@testing-library/react';
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
});
