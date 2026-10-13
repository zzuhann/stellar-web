import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SubmitEventClient from './SubmitEventClient';
import useEventDetail from './hooks/useEventDetail';
import showToast from '@/lib/toast';

const pushMock = vi.fn();

const authState = vi.hoisted(() => ({
  user: { uid: 'user-1' } as { uid: string } | null,
  loading: false,
  authModalOpen: false,
  toggleAuthModal: vi.fn(),
}));

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

vi.mock('./hooks/useEventDetail', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  default: { warning: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api', () => ({
  handleApiError: vi.fn(() => '活動資料載入失敗，請稍後再試'),
}));

// EventSubmissionForm 拉了 react-hook-form / mutation hooks 等重依賴，非本次測試對象，改用輕量替身
const formPropsSpy = vi.hoisted(() => vi.fn());
vi.mock('@/components/submitEvent/EventSubmissionForm', () => ({
  default: (props: Record<string, unknown>) => {
    formPropsSpy(props);
    return <div>event-submission-form-stub</div>;
  },
}));

const useEventDetailMock = vi.mocked(useEventDetail);

const noEventDetail = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
} as unknown as ReturnType<typeof useEventDetail>;

const lastFormProps = () => formPropsSpy.mock.calls.at(-1)?.[0];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  currentSearchParams = createSearchParamsMock([]);
  authState.user = { uid: 'user-1' };
});

describe('SubmitEventClient 編輯模式下活動資料查詢失敗', () => {
  it('顯示重試 UI，且不會導頁回 /my-submissions（避免誤判成活動不存在）', () => {
    currentSearchParams = createSearchParamsMock([['edit', 'event-1']]);
    useEventDetailMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('network error'),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useEventDetail>);

    render(<SubmitEventClient />);

    expect(screen.getByText('活動資料載入失敗，請稍後再試')).toBeTruthy();
    expect(screen.getByRole('button', { name: '重試' })).toBeTruthy();
    expect(pushMock).not.toHaveBeenCalled();
  });
});

describe('SubmitEventClient 編輯模式下表單已載入、使用者編輯中，背景重新整理失敗', () => {
  it('不會卸載表單改顯示整頁錯誤（使用者正在編輯的內容不能被銷毀）', () => {
    currentSearchParams = createSearchParamsMock([['edit', 'event-1']]);
    useEventDetailMock.mockReturnValue({
      data: { id: 'event-1', createdBy: 'user-1' },
      isLoading: false,
      isError: true,
      error: new Error('background refetch failed'),
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useEventDetail>);

    render(<SubmitEventClient />);

    expect(screen.getByText('event-submission-form-stub')).toBeTruthy();
    expect(screen.queryByText('活動資料載入失敗，請稍後再試')).toBeNull();
    expect(pushMock).not.toHaveBeenCalled();
  });
});

describe('SubmitEventClient 編輯模式下活動真的不存在（查詢成功但無資料，反例對照）', () => {
  it('導頁回 /my-submissions 並顯示「活動不存在」提示', () => {
    currentSearchParams = createSearchParamsMock([['edit', 'event-1']]);
    useEventDetailMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useEventDetail>);

    render(<SubmitEventClient />);

    expect(showToast.warning).toHaveBeenCalledWith('活動不存在');
    expect(pushMock).toHaveBeenCalledWith('/my-submissions?tab=event');
  });
});

describe('SubmitEventClient artistId 預選', () => {
  it('TC-005 create 模式帶 artistId：把 artistId 與 entryPoint 傳給表單', () => {
    currentSearchParams = createSearchParamsMock([['artistId', 'artist-9']]);
    useEventDetailMock.mockReturnValue(noEventDetail);

    render(<SubmitEventClient />);

    expect(lastFormProps()).toMatchObject({
      mode: 'create',
      preselectArtistId: 'artist-9',
      entryPoint: 'submit_artist_page',
    });
  });

  it('TC-013 同時帶 edit：以 edit 為準，不傳 artistId 也不帶 entryPoint', () => {
    currentSearchParams = createSearchParamsMock([
      ['edit', 'event-1'],
      ['artistId', 'artist-9'],
    ]);
    useEventDetailMock.mockReturnValue({
      ...noEventDetail,
      data: { id: 'event-1', createdBy: 'user-1' },
    } as unknown as ReturnType<typeof useEventDetail>);

    render(<SubmitEventClient />);

    expect(lastFormProps().mode).toBe('edit');
    expect(lastFormProps().preselectArtistId).toBeUndefined();
    expect(lastFormProps().entryPoint).toBeUndefined();
  });

  it('TC-014 同時帶 copy：以 copy 為準，不傳 artistId 也不帶 entryPoint', () => {
    currentSearchParams = createSearchParamsMock([
      ['copy', 'event-1'],
      ['artistId', 'artist-9'],
    ]);
    useEventDetailMock.mockReturnValue({
      ...noEventDetail,
      data: { id: 'event-1', createdBy: 'user-1' },
    } as unknown as ReturnType<typeof useEventDetail>);

    render(<SubmitEventClient />);

    expect(lastFormProps().mode).toBe('copy');
    expect(lastFormProps().preselectArtistId).toBeUndefined();
    expect(lastFormProps().entryPoint).toBeUndefined();
  });

  it('TC-018 artistId 為空字串視為未提供', () => {
    currentSearchParams = createSearchParamsMock([['artistId', '']]);
    useEventDetailMock.mockReturnValue(noEventDetail);

    render(<SubmitEventClient />);

    expect(lastFormProps().preselectArtistId).toBeUndefined();
    expect(lastFormProps().entryPoint).toBeUndefined();
  });

  it('TC-010 沒有 artistId 的 create 流程：不帶預選也不帶 entryPoint', () => {
    useEventDetailMock.mockReturnValue(noEventDetail);

    render(<SubmitEventClient />);

    expect(lastFormProps().mode).toBe('create');
    expect(lastFormProps().preselectArtistId).toBeUndefined();
    expect(lastFormProps().entryPoint).toBeUndefined();
  });

  it('TC-015 未登入：不渲染表單（不套用預選）、開啟 AuthModal；登入後才帶 artistId 渲染表單', () => {
    authState.user = null;
    currentSearchParams = createSearchParamsMock([['artistId', 'artist-9']]);
    useEventDetailMock.mockReturnValue(noEventDetail);
    const { rerender } = render(<SubmitEventClient />);

    expect(formPropsSpy).not.toHaveBeenCalled();
    expect(authState.toggleAuthModal).toHaveBeenCalled();

    authState.user = { uid: 'user-1' };
    rerender(<SubmitEventClient />);

    expect(lastFormProps()).toMatchObject({
      preselectArtistId: 'artist-9',
      entryPoint: 'submit_artist_page',
    });
  });

  it('TC-022 entryPoint 在 mount 時記錄一次，之後 query 變動不會改變它', () => {
    currentSearchParams = createSearchParamsMock([['artistId', 'artist-9']]);
    useEventDetailMock.mockReturnValue(noEventDetail);
    const { rerender } = render(<SubmitEventClient />);

    currentSearchParams = createSearchParamsMock([]);
    rerender(<SubmitEventClient />);

    expect(lastFormProps().entryPoint).toBe('submit_artist_page');
  });
});
