import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FavoritesList from './FavoritesList';
import type { CoffeeEvent } from '@/types';
vi.mock('@/components/map/overview/OverviewEventCard', () => ({
  default: ({ event, source }: { event: CoffeeEvent; source: string }) => (
    <a href={`/event/${event.id}`} data-source={source}>
      {event.title}
    </a>
  ),
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
afterEach(cleanup);
describe('favorites poster wall', () => {
  it('全部活動在同一面海報牆，沒有藝人分段或截斷', () => {
    const events = Array.from(
      { length: 26 },
      (_, i) => ({ id: `event-${i}`, title: `活動 ${i}` }) as CoffeeEvent
    );
    render(<FavoritesList events={events} artistId="" hasFavorites onReset={vi.fn()} />);
    expect(screen.getAllByRole('list')).toHaveLength(1);
    expect(screen.getAllByRole('link')).toHaveLength(26);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('活動 25').getAttribute('data-source')).toBe('favorites_grid');
  });
  it('篩選無結果可重設，真正空清單導回首頁', () => {
    const reset = vi.fn();
    const { rerender } = render(
      <FavoritesList events={[]} artistId="" hasFavorites onReset={reset} />
    );
    fireEvent.click(screen.getByRole('button', { name: '重設篩選' }));
    expect(reset).toHaveBeenCalledOnce();
    rerender(<FavoritesList events={[]} artistId="" hasFavorites={false} onReset={reset} />);
    expect(screen.getByRole('link', { name: '前往首頁找活動' }).getAttribute('href')).toBe('/');
  });
});
