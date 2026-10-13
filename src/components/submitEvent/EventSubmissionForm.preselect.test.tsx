import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EventSubmissionForm from './EventSubmissionForm';
import { useArtist } from '@/hooks/useArtist';
import type { Artist } from '@/types';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock('@/lib/firebase', () => ({ auth: {}, db: {} }));
vi.mock('@/lib/api', () => ({
  eventsApi: { create: vi.fn(), update: vi.fn() },
  handleApiError: vi.fn(),
}));
vi.mock('@/lib/auth-context', () => {
  const value = { user: { uid: 'user-1', isAnonymous: false } };
  return { useAuth: () => value };
});
vi.mock('@/lib/toast', () => ({ default: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }));
vi.mock('@/hooks/useArtist', () => ({ useArtist: vi.fn() }));
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} />
  ),
}));

const OTHER = { id: 'other-1', stageName: 'OTHER', status: 'approved' } as Artist;

// Stand-in for the real picker: one button that picks a fixed second artist.
vi.mock('../forms/ArtistSelectionModal', () => ({
  default: ({
    isOpen,
    onArtistSelect,
  }: {
    isOpen: boolean;
    onArtistSelect: (a: Artist) => void;
  }) =>
    isOpen ? (
      <button type="button" onClick={() => onArtistSelect(OTHER)}>
        pick-other
      </button>
    ) : null,
}));

const useArtistMock = vi.mocked(useArtist);
const PRESELECTED = {
  id: 'artist-1',
  stageName: 'ALPHA',
  realName: '甲',
  status: 'approved',
} as Artist;

function mockArtistQuery(state: { data?: Artist; isSuccess?: boolean; isError?: boolean }) {
  useArtistMock.mockReturnValue({
    data: state.data,
    isSuccess: state.isSuccess ?? false,
    isError: state.isError ?? false,
  } as ReturnType<typeof useArtist>);
}

function renderForm(props: { preselectArtistId?: string } = {}) {
  const client = new QueryClient();
  const ui = (
    <QueryClientProvider client={client}>
      <EventSubmissionForm mode="create" {...props} />
    </QueryClientProvider>
  );
  const result = render(ui);
  return { ...result, rerenderForm: () => result.rerender(ui) };
}

beforeEach(() => {
  mockArtistQuery({});
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('EventSubmissionForm artistId 預選', () => {
  it('TC-005 預選成功：藝人出現在已選擇列表，且停在第 1 步（選擇藝人）', () => {
    mockArtistQuery({ data: PRESELECTED, isSuccess: true });
    renderForm({ preselectArtistId: 'artist-1' });

    expect(screen.getByRole('button', { name: /已選擇 ALPHA/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: '移除 ALPHA' })).toBeTruthy();
    // Step 1 UI still showing: the picker section is there, step-2 only fields are not.
    expect(screen.getByText('若為聯合應援，可選擇多個藝人')).toBeTruthy();
    expect(screen.queryByLabelText(/活動標題/)).toBeNull();
  });

  it('TC-011 / TC-012 查無藝人、非 approved、查詢失敗：不預選，表單照常顯示', () => {
    for (const state of [
      { isError: true },
      { data: { ...PRESELECTED, status: 'pending' as const }, isSuccess: true },
    ]) {
      mockArtistQuery(state);
      renderForm({ preselectArtistId: 'artist-1' });

      expect(screen.queryByRole('button', { name: /已選擇/ })).toBeNull();
      expect(screen.getByRole('button', { name: /請選擇藝人/ })).toBeTruthy();
      cleanup();
    }
  });

  it('TC-016 查詢回來前使用者已手動選了其他藝人：放棄預選', async () => {
    const user = userEvent.setup();
    const { rerenderForm } = renderForm({ preselectArtistId: 'artist-1' });

    await user.click(screen.getByRole('button', { name: /請選擇藝人/ }));
    await user.click(screen.getByRole('button', { name: 'pick-other' }));
    mockArtistQuery({ data: PRESELECTED, isSuccess: true });
    rerenderForm();

    expect(screen.getByRole('button', { name: /已選擇 OTHER/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /已選擇 ALPHA/ })).toBeNull();
  });

  it('TC-017 預選後可移除，也可加選其他藝人（聯合應援）', async () => {
    const user = userEvent.setup();
    mockArtistQuery({ data: PRESELECTED, isSuccess: true });
    renderForm({ preselectArtistId: 'artist-1' });

    await user.click(screen.getByRole('button', { name: '請選擇藝人' }));
    await user.click(screen.getByRole('button', { name: 'pick-other' }));
    expect(screen.getByRole('button', { name: /已選擇 ALPHA/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /已選擇 OTHER/ })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '移除 ALPHA' }));
    expect(screen.queryByRole('button', { name: /已選擇 ALPHA/ })).toBeNull();
    expect(screen.getByRole('button', { name: /已選擇 OTHER/ })).toBeTruthy();
  });

  it('TC-010 沒有 preselectArtistId：不預選', () => {
    renderForm();

    expect(screen.queryByRole('button', { name: /已選擇/ })).toBeNull();
  });
});
