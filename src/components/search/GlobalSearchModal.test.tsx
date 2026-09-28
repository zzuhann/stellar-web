import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, useState, type ComponentType } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
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

const sendGAEventMock = vi.mocked(sendGAEvent);

const resetStore = () =>
  useSearchModalStore.setState({ isOpen: false, entryPoint: null, triggerRef: null });

describe('GlobalSearchModal eager mount (perf)', () => {
  beforeEach(() => {
    resetStore();
    sendGAEventMock.mockClear();
  });

  afterEach(cleanup);

  it('mounts the modal hidden before the first open, without firing search_artist', async () => {
    render(<GlobalSearchModal />);

    // hidden: true — the dialog is aria-hidden while closed, which getByRole excludes by default.
    const dialog = await screen.findByRole('dialog', { hidden: true });
    expect(dialog.getAttribute('aria-hidden')).toBe('true');
    expect(sendGAEventMock).not.toHaveBeenCalledWith('event', 'search_artist', expect.anything());
  });
});

describe('GlobalSearchModal route-change close (TC-019)', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(cleanup);

  it.each([
    {
      label: 'root to a dynamic segment (/ -> /map/some-other-artist)',
      from: '/',
      to: '/map/some-other-artist',
    },
    {
      label: 'same dynamic segment, different param (/map/A -> /map/B)',
      from: '/map/artist-a',
      to: '/map/artist-b',
    },
  ])('closes and clears its input on a route change: $label', async ({ from, to }) => {
    mockPathname = from;
    const user = userEvent.setup();
    useSearchModalStore.getState().open('header', { current: null });
    const { rerender } = render(<GlobalSearchModal />);

    const input = await screen.findByRole('textbox', { name: '搜尋藝人' });
    await user.type(input, '不會保留');

    mockPathname = to;
    rerender(<GlobalSearchModal />);

    await waitFor(() => expect(useSearchModalStore.getState().isOpen).toBe(false));

    // Assert the input is already cleared before reopening, not just after.
    expect((input as HTMLInputElement).value).toBe('');

    // Reopen from the same store and confirm the input came back empty.
    useSearchModalStore.getState().open('header', { current: null });
    rerender(<GlobalSearchModal />);

    const reopenedInput = await screen.findByRole('textbox', { name: '搜尋藝人' });
    expect((reopenedInput as HTMLInputElement).value).toBe('');
  });
});
