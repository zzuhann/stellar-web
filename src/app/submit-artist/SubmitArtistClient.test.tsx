import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, useState, type ComponentType } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import SubmitArtistClient from './SubmitArtistClient';
import GlobalSearchModal from '@/components/search/GlobalSearchModal';
import { useSearchModalStore } from '@/store/useSearchModalStore';

const push = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/submit-artist',
  useSearchParams: () => currentSearchParams,
}));

// next/dynamic's ssr:false loader is async; resolve it via an effect so the real ArtistSearchModal renders.
vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<{ default: ComponentType<Record<string, unknown>> }>) => {
    return function Dynamic(props: Record<string, unknown>) {
      const [Comp, setComp] = useState<ComponentType<Record<string, unknown>> | null>(null);
      useEffect(() => {
        loader().then((mod) => setComp(() => mod.default));
      }, []);
      return Comp ? <Comp {...props} /> : null;
    };
  },
}));

vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }));

// Stable object identity: a fresh object per render would retrigger effects keyed on useAuth() values.
const authValue = {
  user: { uid: 'user-1' },
  loading: false,
  authModalOpen: false,
  toggleAuthModal: vi.fn(),
};
vi.mock('@/lib/auth-context', () => ({ useAuth: () => authValue }));

vi.mock('@/lib/firebase', () => ({ auth: {}, db: {} }));

vi.mock('@/hooks/useAuthToken', () => ({ useAuthToken: () => ({ getToken: vi.fn() }) }));

vi.mock('@/components/images/ImageUpload', () => ({ default: () => <div /> }));

vi.mock('@/lib/api', () => ({
  artistsApi: { getById: vi.fn(), create: vi.fn(), update: vi.fn() },
  handleApiError: vi.fn(),
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

const ENTRY_NAME = /投稿前，先確認你想新增的藝人、團體是否已經存在/;

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <SubmitArtistClient />
      <GlobalSearchModal />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  currentSearchParams = new URLSearchParams();
  useSearchModalStore.setState({ isOpen: false, entryPoint: null, triggerRef: null });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('SubmitArtistClient 搜尋入口', () => {
  it('TC-001 create 模式顯示搜尋入口', () => {
    renderPage();

    expect(screen.getByRole('button', { name: ENTRY_NAME })).toBeTruthy();
  });

  it('TC-001 edit 模式不顯示搜尋入口', async () => {
    currentSearchParams = new URLSearchParams('edit=artist-1');
    const { artistsApi } = await import('@/lib/api');
    vi.mocked(artistsApi.getById).mockResolvedValue({
      id: 'artist-1',
      stageName: 'X',
      status: 'rejected',
      createdBy: 'user-1',
    } as never);
    renderPage();

    await screen.findByRole('form', { name: '藝人投稿表單' });
    expect(screen.queryByRole('button', { name: ENTRY_NAME })).toBeNull();
  });

  it('TC-002 / TC-019 點擊入口開啟彈窗，entryPoint=submit_artist_page 並送 search_artist', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: ENTRY_NAME }));

    expect(useSearchModalStore.getState().isOpen).toBe(true);
    expect(useSearchModalStore.getState().entryPoint).toBe('submit_artist_page');
    await waitFor(() =>
      expect(sendGAEvent).toHaveBeenCalledWith('event', 'search_artist', {
        event_page: '/submit-artist',
        user_id: 'user-1',
        content_id: '',
        entry_point: 'submit_artist_page',
      })
    );
  });

  it('TC-023 入口是 type=button、aria-haspopup=dialog，Enter / Space 可開啟彈窗', async () => {
    const user = userEvent.setup();
    renderPage();
    const entry = screen.getByRole('button', { name: ENTRY_NAME });

    expect(entry.getAttribute('type')).toBe('button');
    expect(entry.getAttribute('aria-haspopup')).toBe('dialog');

    // Let any focus-return rAF left over from an earlier test's modal settle before moving focus.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    entry.focus();
    await user.keyboard('{Enter}');
    expect(useSearchModalStore.getState().isOpen).toBe(true);

    useSearchModalStore.getState().close();
    await waitFor(() => expect(useSearchModalStore.getState().isOpen).toBe(false));
    entry.focus();
    await user.keyboard(' ');
    expect(useSearchModalStore.getState().isOpen).toBe(true);
  });

  it('TC-006 查無結果按「找不到，繼續填寫表單」：彈窗關閉、不導航、表單內容保留', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/藝名（請填寫官方正名的英文名稱）/), 'MYSTAR');

    await user.click(screen.getByRole('button', { name: ENTRY_NAME }));
    await user.type(await screen.findByRole('textbox', { name: '搜尋藝人' }), 'zzz');
    await user.click(await screen.findByRole('button', { name: /找不到，繼續填寫表單/ }));

    expect(useSearchModalStore.getState().isOpen).toBe(false);
    expect(push).not.toHaveBeenCalled();
    expect(
      (screen.getByLabelText(/藝名（請填寫官方正名的英文名稱）/) as HTMLInputElement).value
    ).toBe('MYSTAR');
  });

  it('TC-007 右上角 X 關閉彈窗，表單內容保留', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.type(screen.getByLabelText(/藝名（請填寫官方正名的英文名稱）/), 'MYSTAR');

    await user.click(screen.getByRole('button', { name: ENTRY_NAME }));
    await user.click(await screen.findByRole('button', { name: '關閉搜尋' }));

    expect(useSearchModalStore.getState().isOpen).toBe(false);
    expect(
      (screen.getByLabelText(/藝名（請填寫官方正名的英文名稱）/) as HTMLInputElement).value
    ).toBe('MYSTAR');
  });

  it.each([
    [
      '底部 CTA',
      async (u: ReturnType<typeof userEvent.setup>) =>
        u.click(await screen.findByRole('button', { name: /找不到，繼續填寫表單/ })),
    ],
    [
      'X 按鈕',
      async (u: ReturnType<typeof userEvent.setup>) =>
        u.click(await screen.findByRole('button', { name: '關閉搜尋' })),
    ],
    ['Esc', async (u: ReturnType<typeof userEvent.setup>) => u.keyboard('{Escape}')],
    [
      '點遮罩',
      async (u: ReturnType<typeof userEvent.setup>) =>
        u.click(await screen.findByLabelText('搜尋藝人', { selector: '[role=dialog]' })),
    ],
  ])('TC-027 以%s關閉彈窗後焦點回到搜尋入口', async (_label, closeIt) => {
    const user = userEvent.setup();
    renderPage();
    const entry = screen.getByRole('button', { name: ENTRY_NAME });

    await user.click(entry);
    await user.type(await screen.findByRole('textbox', { name: '搜尋藝人' }), 'zzz');
    await closeIt(user);

    await waitFor(() => expect(document.activeElement).toBe(entry));
  });
});
