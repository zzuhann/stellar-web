import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TopArtistsSection from './TopArtistsSection';
import { useSearchModalStore } from '@/store/useSearchModalStore';

vi.mock('@/hooks/useHomePage', () => ({
  useTopArtistsQuery: () => ({ data: [], isLoading: true }),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: null }),
}));

// TopArtistCarousel drags in Swiper/next-image; irrelevant to the pill behavior under test.
vi.mock('./TopArtistCarousel', () => ({
  default: () => null,
}));

const resetStore = () =>
  useSearchModalStore.setState({ isOpen: false, entryPoint: null, triggerRef: null });

describe('TopArtistsSection search pill', () => {
  beforeEach(resetStore);
  afterEach(cleanup);

  it('renders an outline pill labeled 搜尋藝人 as a sibling of the h2, not nested inside it (design-frontend.md #2)', () => {
    render(<TopArtistsSection />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('🧚 擁有最多即將到來的生咖');

    const button = screen.getByRole('button', { name: '搜尋藝人' });
    expect(heading.contains(button)).toBe(false);
  });

  it('opens the shared search modal store with entryPoint=top_artists and its own ref (TC-002/008/021)', async () => {
    const user = userEvent.setup();
    render(<TopArtistsSection />);

    const button = screen.getByRole('button', { name: '搜尋藝人' });
    await user.click(button);

    const state = useSearchModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.entryPoint).toBe('top_artists');
    expect(state.triggerRef?.current).toBe(button);
  });

  it('clicking again while already open is a no-op (does not switch entryPoint away from top_artists)', async () => {
    const user = userEvent.setup();
    render(<TopArtistsSection />);

    const button = screen.getByRole('button', { name: '搜尋藝人' });
    await user.click(button);
    await user.click(button);

    expect(useSearchModalStore.getState().entryPoint).toBe('top_artists');
  });
});
