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
describe('favorites poster groups', () => {
  it('只展開指定藝人，使用收藏頁追蹤來源', () => {
    const groups = ['A', 'B'].map((id) => ({
      id,
      name: id,
      events: Array.from(
        { length: 13 },
        (_, i) => ({ id: `${id}-${i}`, title: `${id}-${i}` }) as CoffeeEvent
      ),
    }));
    render(<FavoritesList groups={groups} hasFavorites onReset={vi.fn()} />);
    expect(screen.queryByText('A-12')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '顯示更多 A 的活動' }));
    expect(screen.getByText('A-12').getAttribute('data-source')).toBe('favorites_grid');
    expect(screen.queryByText('B-12')).toBeNull();
  });
  it('篩選無結果可重設，真正空清單導回首頁', () => {
    const reset = vi.fn();
    const { rerender } = render(<FavoritesList groups={[]} hasFavorites onReset={reset} />);
    fireEvent.click(screen.getByRole('button', { name: '重設篩選' }));
    expect(reset).toHaveBeenCalledOnce();
    rerender(<FavoritesList groups={[]} hasFavorites={false} onReset={reset} />);
    expect(screen.getByRole('link', { name: '前往首頁找活動' }).getAttribute('href')).toBe('/');
  });
});
