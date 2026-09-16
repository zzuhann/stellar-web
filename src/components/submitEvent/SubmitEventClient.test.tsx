import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SubmitEventClient from './SubmitEventClient';
import useEventDetail from './hooks/useEventDetail';
import showToast from '@/lib/toast';

const pushMock = vi.fn();

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { uid: 'user-1' },
    loading: false,
    authModalOpen: false,
    toggleAuthModal: vi.fn(),
  }),
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
vi.mock('@/components/submitEvent/EventSubmissionForm', () => ({
  default: () => <div>event-submission-form-stub</div>,
}));

const useEventDetailMock = vi.mocked(useEventDetail);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  currentSearchParams = createSearchParamsMock([]);
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
