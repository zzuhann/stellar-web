import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EventLocationLink from './EventLocationLink';

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: null }),
}));

afterEach(cleanup);

const location = {
  name: '測試場地',
  address: '台北市測試路 1 號',
  coordinates: { lat: 25, lng: 121 },
  venueId: 'venue-1',
};

describe('EventLocationLink', () => {
  it('active venue 連到場地詳情頁', () => {
    render(<EventLocationLink location={{ ...location, venueActive: true }} eventId="event-1" />);

    expect(screen.getByRole('link', { name: /查看場地詳情/ }).getAttribute('href')).toBe(
      '/venues/venue-1'
    );
  });

  it.each([false, undefined])('venueActive=%s 時降級為 Google Maps', (venueActive) => {
    render(<EventLocationLink location={{ ...location, venueActive }} eventId="event-1" />);

    expect(screen.getByRole('link', { name: /Google 地圖/ }).getAttribute('href')).toBe(
      'https://www.google.com/maps/search/?api=1&query=25,121'
    );
  });
});
