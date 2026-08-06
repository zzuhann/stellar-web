import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useResubmitEventMutation from './useResubmitEventMutation';
import { eventsApi, handleApiError } from '@/lib/api';
import showToast from '@/lib/toast';
import type { CoffeeEvent } from '@/types';

const pushMock = vi.fn();
const invalidateQueriesMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/lib/api', () => ({
  eventsApi: { resubmit: vi.fn() },
  handleApiError: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

// 同 useUpdateEventMutation.test.ts：resubmit 也會改動這筆活動的 status，
// useEventDetail 的 ['event', id] 快取要一併清掉，否則重新編輯同一筆會拿到舊資料
vi.mock('@tanstack/react-query', () => ({
  useMutation: <TData, TVariables>(options: {
    mutationFn: (variables: TVariables) => Promise<TData>;
    onSuccess?: (data: TData) => void;
    onError?: (error: unknown) => void;
  }) => ({
    isPending: false,
    mutate: (variables: TVariables) => {
      options
        .mutationFn(variables)
        .then((data) => options.onSuccess?.(data))
        .catch((error) => options.onError?.(error));
    },
  }),
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

const resubmitMock = vi.mocked(eventsApi.resubmit);
const handleApiErrorMock = vi.mocked(handleApiError);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useResubmitEventMutation', () => {
  it('重新送審成功後 invalidate ["event", id]，並導回投稿列表', async () => {
    resubmitMock.mockResolvedValueOnce({ id: 'event-1' } as CoffeeEvent);

    const { result } = renderHook(() => useResubmitEventMutation());

    await act(async () => {
      result.current.mutate('event-1');
      await Promise.resolve();
    });

    expect(resubmitMock).toHaveBeenCalledWith('event-1');
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['event', 'event-1'] });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['events'] });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['map-data'] });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['user-submissions'] });
    expect(showToast.success).toHaveBeenCalledWith('已重新送出審核！');
    expect(pushMock).toHaveBeenCalledWith('/my-submissions?tab=event');
  });

  it('重新送審失敗時顯示錯誤 toast，不 invalidate、不導頁', async () => {
    const requestError = new Error('server error');
    resubmitMock.mockRejectedValueOnce(requestError);
    handleApiErrorMock.mockReturnValueOnce('重新送出審核時發生錯誤，請稍後再試');

    const { result } = renderHook(() => useResubmitEventMutation());

    await act(async () => {
      result.current.mutate('event-1');
      await Promise.resolve();
    });

    expect(handleApiErrorMock).toHaveBeenCalledWith(requestError, '重新送出審核時發生錯誤');
    expect(showToast.error).toHaveBeenCalledWith('重新送出審核時發生錯誤，請稍後再試');
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
