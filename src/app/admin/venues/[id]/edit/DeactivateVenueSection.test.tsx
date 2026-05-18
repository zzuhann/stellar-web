import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import DeactivateVenueSection from './DeactivateVenueSection';
import type { VenueEventCard } from '@/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ mutate: vi.fn(), isPending: false }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  venueApi: { updateVenue: vi.fn(), permanentDeleteVenue: vi.fn() },
}));

vi.mock('@/lib/toast', () => ({
  showToast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/hooks/queryKey', () => ({
  default: {
    adminVenues: () => ['admin-venues'],
    venueDetail: (id: string) => ['venue-detail', id],
  },
}));

afterEach(cleanup);

const renderSection = (currentStatus: 'active' | 'inactive', events: VenueEventCard[] = []) =>
  render(
    <DeactivateVenueSection venueId="venue-123" currentStatus={currentStatus} events={events} />
  );

const fakeEvent: VenueEventCard = {
  id: 'event-1',
  title: 'Test',
  artistName: 'Artist',
  startDate: '',
  endDate: '',
  coverImage: '',
  slug: null,
};

describe('DeactivateVenueSection', () => {
  it('active 場地 → 顯示「下架場地」，不顯示「永久刪除場地」', () => {
    renderSection('active');
    expect(screen.getByRole('button', { name: '下架場地' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '永久刪除場地' })).toBeNull();
  });

  it('inactive + 無關聯活動 → 顯示「永久刪除場地」，不顯示「下架場地」', () => {
    renderSection('inactive', []);
    expect(screen.getByRole('button', { name: '永久刪除場地' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '下架場地' })).toBeNull();
  });

  it('inactive + 有關聯活動 → 兩個按鈕都不顯示', () => {
    renderSection('inactive', [fakeEvent]);
    expect(screen.queryByRole('button', { name: '下架場地' })).toBeNull();
    expect(screen.queryByRole('button', { name: '永久刪除場地' })).toBeNull();
  });
});
