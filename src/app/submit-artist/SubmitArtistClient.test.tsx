import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SubmitArtistClient from './SubmitArtistClient';

const pushMock = vi.fn();

function createAuthMock(overrides: Partial<ReturnType<typeof defaultAuthState>> = {}) {
  return { ...defaultAuthState(), ...overrides };
}

function defaultAuthState() {
  return {
    user: null as { uid: string } | null,
    loading: false,
    authModalOpen: false,
    openAuthModal: vi.fn(),
    closeAuthModal: vi.fn(),
  };
}

let authState = createAuthMock();

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => authState,
}));

function createSearchParamsMock(entries: [string, string][]) {
  return {
    get: (key: string) => entries.find(([k]) => k === key)?.[1] ?? null,
  };
}

let currentSearchParams = createSearchParamsMock([]);

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => currentSearchParams,
}));

vi.mock('@/lib/api', () => ({
  artistsApi: { getById: vi.fn() },
}));

vi.mock('@/lib/toast', () => ({
  showToast: { warning: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

// ArtistSubmissionForm 拉了大量表單依賴，非本次測試對象，改用輕量替身
vi.mock('@/components/forms/ArtistSubmissionForm', () => ({
  default: () => <div>artist-submission-form-stub</div>,
}));

function renderSubmitArtistClient() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SubmitArtistClient />
    </QueryClientProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  currentSearchParams = createSearchParamsMock([]);
  authState = createAuthMock();
});

describe('SubmitArtistClient 登入 modal 行為（回歸測試：修正 toggleAuthModal race condition）', () => {
  beforeEach(() => {
    authState = createAuthMock({ user: null });
  });

  it('未登入且 loading 完成時開啟登入 modal（openAuthModal 是明確設值，不是 toggle，呼叫多次也不會抵銷）', () => {
    authState = createAuthMock({ user: null, authModalOpen: false });

    renderSubmitArtistClient();

    expect(authState.openAuthModal).toHaveBeenCalled();
  });

  it('modal 關閉時若仍未登入就導回首頁，不論 modal 是誰打開的', () => {
    // 模擬 modal 是被別的地方打開的（例如 header 或 401 攔截器），
    // 而不是這個頁面自己的 effect 打開的
    authState = createAuthMock({ user: null, authModalOpen: true });
    const { rerender } = renderSubmitArtistClient();

    authState = createAuthMock({ user: null, authModalOpen: false });
    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <SubmitArtistClient />
      </QueryClientProvider>
    );

    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('登入成功後 modal 關閉且不會導回首頁（留在原頁面）', () => {
    authState = createAuthMock({ user: null, authModalOpen: true });
    const { rerender } = renderSubmitArtistClient();

    authState = createAuthMock({ user: { uid: 'user-1' }, authModalOpen: false });
    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <SubmitArtistClient />
      </QueryClientProvider>
    );

    expect(pushMock).not.toHaveBeenCalledWith('/');
  });
});

describe('SubmitArtistClient 已登入', () => {
  it('渲染表單，不開啟登入 modal', () => {
    authState = createAuthMock({ user: { uid: 'user-1' }, authModalOpen: false });

    renderSubmitArtistClient();

    expect(screen.getByText('artist-submission-form-stub')).toBeTruthy();
    expect(authState.openAuthModal).not.toHaveBeenCalled();
  });
});
