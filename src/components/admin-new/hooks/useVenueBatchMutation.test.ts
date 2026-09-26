import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVenueBatchMutation } from './useVenueBatchMutation';
import { venueApi, handleApiError } from '@/lib/api';
import { revalidatePublicPages } from '@/lib/revalidate';
import { showToast } from '@/lib/toast';

const invalidateQueriesMock = vi.fn();

vi.mock('@/lib/api', () => ({
  venueApi: { batchReviewVenues: vi.fn(), batchStatusVenues: vi.fn() },
  handleApiError: vi.fn(),
}));

vi.mock('@/lib/revalidate', () => ({
  revalidatePublicPages: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  showToast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: <TData, TVariables>(options: {
    mutationFn: (variables: TVariables) => Promise<TData>;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: unknown) => void;
  }) => ({
    isPending: false,
    mutate: (variables: TVariables, callbacks?: { onSuccess?: () => void }) => {
      options
        .mutationFn(variables)
        .then((data) => {
          options.onSuccess?.(data, variables);
          callbacks?.onSuccess?.();
        })
        .catch((error) => options.onError?.(error));
    },
  }),
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

const batchReviewVenuesMock = vi.mocked(venueApi.batchReviewVenues);
const batchStatusVenuesMock = vi.mocked(venueApi.batchStatusVenues);
const handleApiErrorMock = vi.mocked(handleApiError);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useVenueBatchMutation', () => {
  it('批次核准成功後，清全部公開頁快取', async () => {
    batchReviewVenuesMock.mockResolvedValueOnce({ message: 'ok' });
    const selectedIds = new Set(['venue-1', 'venue-2']);

    const { result } = renderHook(() => useVenueBatchMutation(selectedIds));

    await act(async () => {
      result.current.mutate('approve');
      await Promise.resolve();
    });

    expect(batchReviewVenuesMock).toHaveBeenCalledWith([
      { venueId: 'venue-1', status: 'active' },
      { venueId: 'venue-2', status: 'active' },
    ]);
    expect(revalidatePublicPages).toHaveBeenCalledTimes(1);
    expect(showToast.success).toHaveBeenCalledWith('已審核通過 2 間場地');
  });

  it('批次上下架也會清全部公開頁快取', async () => {
    batchStatusVenuesMock.mockResolvedValueOnce({ message: 'ok' });
    const selectedIds = new Set(['venue-3']);

    const { result } = renderHook(() => useVenueBatchMutation(selectedIds));

    await act(async () => {
      result.current.mutate('offline');
      await Promise.resolve();
    });

    expect(batchStatusVenuesMock).toHaveBeenCalledWith([
      { venueId: 'venue-3', status: 'inactive' },
    ]);
    expect(revalidatePublicPages).toHaveBeenCalledTimes(1);
    expect(showToast.success).toHaveBeenCalledWith('已下架 1 間場地');
  });

  it('API 失敗時呼叫 onError，不清快取', async () => {
    const requestError = new Error('server error');
    batchReviewVenuesMock.mockRejectedValueOnce(requestError);
    handleApiErrorMock.mockReturnValueOnce('操作失敗，請稍後再試');
    const onError = vi.fn();
    const selectedIds = new Set(['venue-1']);

    const { result } = renderHook(() => useVenueBatchMutation(selectedIds, { onError }));

    await act(async () => {
      result.current.mutate('reject');
      await Promise.resolve();
    });

    expect(onError).toHaveBeenCalledWith('操作失敗，請稍後再試');
    expect(revalidatePublicPages).not.toHaveBeenCalled();
  });
});
