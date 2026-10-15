import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EventSubmissionForm from './EventSubmissionForm';
import { useArtist } from '@/hooks/useArtist';
import type { Artist, CoffeeEvent } from '@/types';
import type { ComponentProps } from 'react';
import DatePicker from '../DatePicker';

const authUser = vi.hoisted(() => ({ uid: 'user-1', isAnonymous: false }));
const mutations = vi.hoisted(() => ({
  create: { isPending: false, mutate: vi.fn() },
  update: { isPending: false, mutate: vi.fn() },
  resubmit: { isPending: false, mutate: vi.fn() },
}));
vi.mock('./hooks/useCreateEventMutation', () => ({ default: () => mutations.create }));
vi.mock('./hooks/useUpdateEventMutation', () => ({ default: () => mutations.update }));
vi.mock('./hooks/useResubmitEventMutation', () => ({ default: () => mutations.resubmit }));
vi.mock('@/hooks/useAuthToken', () => ({ useAuthToken: () => ({ token: null }) }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock('@/lib/firebase', () => ({ auth: {}, db: {} }));
vi.mock('@/lib/api', () => ({
  eventsApi: { create: vi.fn(), update: vi.fn() },
  placesApi: { autocomplete: vi.fn().mockResolvedValue([]) },
  handleApiError: vi.fn(),
}));
vi.mock('@/lib/auth-context', () => {
  const value = { user: authUser };
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

function renderForm(props: ComponentProps<typeof EventSubmissionForm> = {}) {
  const client = new QueryClient();
  // Fresh JSX each time (same client) so rerender actually re-renders the form.
  const buildUi = () => (
    <QueryClientProvider client={client}>
      <EventSubmissionForm mode="create" {...props} />
    </QueryClientProvider>
  );
  const result = render(buildUi());
  return { ...result, rerenderForm: () => result.rerender(buildUi()) };
}

beforeEach(() => {
  mockArtistQuery({});
  authUser.isAnonymous = false;
  Object.values(mutations).forEach((mutation) => {
    mutation.isPending = false;
  });
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
    useArtistMock.mockClear();
    mockArtistQuery({ data: PRESELECTED, isSuccess: true });
    rerenderForm();

    // The late success result must really reach the form, otherwise this test proves nothing.
    expect(useArtistMock).toHaveBeenCalled();
    expect(useArtistMock.mock.results.at(-1)?.value).toMatchObject({ isSuccess: true });
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

const EVENT = {
  id: 'event-1',
  title: '原本標題',
  description: '原本說明',
  artists: [{ id: 'artist-1', name: 'ALPHA' }],
  datetime: {
    start: { _seconds: 1798761600, _nanoseconds: 0 },
    end: { _seconds: 1798847999, _nanoseconds: 0 },
  },
  location: { name: '測試咖啡廳', address: '', coordinates: { lat: 25, lng: 121 } },
  socialMedia: { instagram: 'test_account' },
  reservation: { url: 'https://example.com', startAt: { _seconds: 1798761600, _nanoseconds: 0 } },
  status: 'rejected',
} as CoffeeEvent;

describe('EventSubmissionForm pending interactions', () => {
  it.each(['create', 'update', 'resubmit'] as const)(
    '%s locks every native control and restores editing after pending ends',
    async (mutation) => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      const { rerenderForm } = renderForm({
        mode: mutation === 'create' ? 'copy' : 'edit',
        existingEvent: EVENT,
        onCancel,
      });
      const title = screen.getByRole('textbox', { name: /主題名稱/ }) as HTMLInputElement;
      mutations[mutation].isPending = true;
      rerenderForm();

      const form = screen.getByRole('form');
      const controls = form.querySelectorAll('input, textarea, button');
      expect(controls.length).toBeGreaterThan(10);
      for (const control of controls) expect(control.matches(':disabled')).toBe(true);
      expect(form.getAttribute('aria-busy')).toBe('true');
      await user.type(title, '不應寫入');
      await user.click(screen.getByRole('button', { name: '取消' }));
      expect(title.value).toBe('原本標題');
      expect(onCancel).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: /投稿中|更新中|重新送出審核中/ }));
      for (const state of Object.values(mutations)) expect(state.mutate).not.toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: /點擊上傳主視覺圖片/ }).getAttribute('aria-disabled')
      ).toBe('true');

      mutations[mutation].isPending = false;
      rerenderForm();
      expect(form.getAttribute('aria-busy')).toBe('false');
      await user.type(title, '可編輯');
      expect(title.value).toBe('原本標題可編輯');
      await user.click(screen.getByRole('button', { name: '取消' }));
      expect(onCancel).toHaveBeenCalledOnce();
    }
  );

  it('create mode locks anonymous email and the previous-step button while submitting', async () => {
    authUser.isAnonymous = true;
    const user = userEvent.setup();
    mockArtistQuery({ data: PRESELECTED, isSuccess: true });
    const { rerenderForm } = renderForm({ preselectArtistId: PRESELECTED.id });
    await user.click(screen.getByRole('button', { name: '下一步' }));
    mutations.create.isPending = true;
    rerenderForm();
    const email = screen.getByPlaceholderText('example@email.com') as HTMLInputElement;
    expect(email.matches(':disabled')).toBe(true);
    await user.type(email, 'ignored@example.com');
    expect(email.value).toBe('');
    await user.click(screen.getByRole('button', { name: '上一步' }));
    expect(screen.getByRole('textbox', { name: /主題名稱/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '下一步' })).toBeNull();
  });
});

describe('DatePicker disabled', () => {
  it('disables the trigger and removes an already-open calendar until enabled again', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<DatePicker value="2027-01-01" onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: '選擇日期' });
    await user.click(trigger);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(1);

    rerender(<DatePicker value="2027-01-01" onChange={onChange} disabled />);
    expect(trigger.matches(':disabled')).toBe(true);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    await user.click(trigger);
    expect(onChange).not.toHaveBeenCalled();

    rerender(<DatePicker value="2027-01-01" onChange={onChange} />);
    expect(trigger.matches(':disabled')).toBe(false);
  });
});
