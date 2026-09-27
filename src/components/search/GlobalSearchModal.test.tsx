import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, useState, type ComponentType } from 'react';
import GlobalSearchModal from './GlobalSearchModal';
import { useSearchModalStore } from '@/store/useSearchModalStore';

let mockPathname = '/';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => mockPathname,
}));

// next/dynamic's real ssr:false loader is async; resolve it via an effect so the real ArtistSearchModal renders once the import settles.
vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<{ default: ComponentType<Record<string, unknown>> }>) => {
    return function Dynamic(props: Record<string, unknown>) {
      const [Comp, setComp] = useState<ComponentType<Record<string, unknown>> | null>(null);
      useEffect(() => {
        let cancelled = false;
        loader().then((mod) => {
          if (!cancelled) setComp(() => mod.default);
        });
        return () => {
          cancelled = true;
        };
      }, []);
      return Comp ? <Comp {...props} /> : null;
    };
  },
}));

vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: null, toggleAuthModal: vi.fn() }),
}));

vi.mock('@/hooks/useArtistSearch', () => ({
  useArtistSearch: () => ({ data: [], isLoading: false }),
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}));

vi.mock('@/hooks/useScrollLock', () => ({
  useScrollLock: () => {},
}));

const resetStore = () =>
  useSearchModalStore.setState({ isOpen: false, entryPoint: null, triggerRef: null });

describe('GlobalSearchModal route-change close (TC-019)', () => {
  beforeEach(() => {
    mockPathname = '/';
    resetStore();
  });

  afterEach(cleanup);

  it('closes and clears its input on a route change, including a dynamic-segment swap like /map/A -> /map/B', async () => {
    const user = userEvent.setup();
    useSearchModalStore.getState().open('header', { current: null });
    const { rerender } = render(<GlobalSearchModal />);

    const input = await screen.findByRole('textbox', { name: '搜尋藝人' });
    await user.type(input, '不會保留');

    // Simulate a route change, including the same dynamic segment with a different param.
    mockPathname = '/map/some-other-artist';
    rerender(<GlobalSearchModal />);

    await waitFor(() => expect(useSearchModalStore.getState().isOpen).toBe(false));

    // Reopen from the same store and confirm the input came back empty.
    useSearchModalStore.getState().open('header', { current: null });
    rerender(<GlobalSearchModal />);

    const reopenedInput = await screen.findByRole('textbox', { name: '搜尋藝人' });
    expect((reopenedInput as HTMLInputElement).value).toBe('');
  });
});
