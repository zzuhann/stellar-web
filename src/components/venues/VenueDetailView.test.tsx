import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendGAEvent } from '@next/third-parties/google';
import type { VenueDetail } from '@/types';
import VenueDetailView from './VenueDetailView';

vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }));
vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/lib/api', () => ({ venueApi: { getVenueById: vi.fn(), getVenues: vi.fn() } }));

afterEach(cleanup);

const baseVenue: VenueDetail = {
  id: 'v1',
  name: '燈亮有酒',
  address: '台北市某路 1 號',
  region: '台北',
  lat: 25,
  lng: 121.5,
  placeId: 'place-1',
  nearestMrt: null,
  mrtWalkMinutes: null,
  capacityRange: null,
  eventCount: 0,
  coverPhoto: null,
  description: '',
  otherPhotos: [],
  hostTags: [],
  status: 'active',
  socialMedia: { instagram: 'light_bar' },
  events: [],
};

describe('TC-097 正式頁換版前，聯絡按鈕不變', () => {
  it.each<{
    name: string;
    venue: Partial<VenueDetail>;
    label: string;
    href: string;
    contactType: string;
  }>([
    {
      name: 'form ＋ contactUrl ＋ bookingFormUrl（燈亮有酒補完表單、還沒換版）',
      venue: {
        preferredContact: 'form',
        contactUrl: 'https://forms.gle/legacy',
        bookingFormUrl: 'https://forms.gle/booking',
      },
      label: '查看預約資訊',
      href: 'https://forms.gle/legacy',
      contactType: 'form',
    },
    {
      name: 'line ＋ contactUrl',
      venue: { preferredContact: 'line', contactUrl: 'https://lin.ee/abc' },
      label: 'LINE 聯繫',
      href: 'https://lin.ee/abc',
      contactType: 'line',
    },
    {
      name: 'instagram ＋ IG 帳號',
      venue: { preferredContact: 'instagram' },
      label: '前往 Instagram 主頁',
      href: 'https://www.instagram.com/light_bar',
      contactType: 'instagram',
    },
  ])('$name', async ({ venue, label, href, contactType }) => {
    render(<VenueDetailView venue={{ ...baseVenue, ...venue }} relatedVenues={[]} />);

    const button = screen.getByRole('link', { name: `${label}（開新分頁）` });
    expect(button.getAttribute('href')).toBe(href);
    expect(screen.queryByText(/預約表單/)).toBeNull();
    expect(screen.queryByText(/填完記得私訊店家確認/)).toBeNull();

    button.addEventListener('click', (e) => e.preventDefault());
    await userEvent.setup().click(button);
    expect(sendGAEvent).toHaveBeenCalledWith(
      'event',
      'click_venue_contact',
      expect.objectContaining({ contact_type: contactType })
    );
  });
});

describe('TC-022 正式頁換版前不變', () => {
  it('活動區不出現狀態標籤（就算 API 帶了 timeStatus）', () => {
    render(
      <VenueDetailView
        venue={{
          ...baseVenue,
          events: [
            {
              id: 'e1',
              title: '生日應援',
              artistName: 'WONWOO',
              startDate: '2026-10-10',
              endDate: '2026-10-20',
              coverImage: '',
              slug: null,
              timeStatus: 'ongoing',
            },
            {
              id: 'e2',
              title: '下週應援',
              artistName: 'WONWOO',
              startDate: '2026-10-30',
              endDate: '2026-10-31',
              coverImage: '',
              slug: null,
              timeStatus: 'upcoming',
            },
          ],
        }}
        relatedVenues={[]}
      />
    );
    expect(screen.queryAllByText(/^(進行中|即將到來)$/)).toHaveLength(0);
  });

  it('/venues/[id] 仍是 ISR（revalidate = 86400）', async () => {
    const page = await import('@/app/venues/[id]/page');
    expect(page.revalidate).toBe(86400);
  });
});
