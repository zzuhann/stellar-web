import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useDeleteEventMutation from './useDeleteEventMutation';
import { eventsApi } from '@/lib/api';
import { revalidatePaths } from '@/lib/revalidate';
import showToast from '@/lib/toast';
import type { DeleteEventVariables } from './useDeleteEventMutation';

const invalidateQueriesMock = vi.fn();

vi.mock('@/lib/api', () => ({
  eventsApi: { delete: vi.fn() },
}));

vi.mock('@/lib/revalidate', () => ({
  revalidatePaths: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

// 同 useUpdateEventMutation.test.ts：['event', id] 快取也要清掉。onSuccess 用的是
// mutation variables 而非回傳值，故 mock 的 useMutation 要把 variables 傳給 onSuccess
vi.mock('@tanstack/react-query', () => ({
  useMutation: <TData, TVariables>(options: {
    mutationFn: (variables: TVariables) => Promise<TData>;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: unknown) => void;
  }) => ({
    isPending: false,
    mutate: (variables: TVariables) => {
      options
        .mutationFn(variables)
        .then((data) => options.onSuccess?.(data, variables))
        .catch((error) => options.onError?.(error));
    },
  }),
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

const deleteMock = vi.mocked(eventsApi.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDeleteEventMutation', () => {
  it('刪除成功後 invalidate ["event", id]', async () => {
    deleteMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteEventMutation());

    const variables: DeleteEventVariables = {
      eventId: 'event-1',
      slug: 'event-1-slug',
      artistSlugs: ['artist-1-slug'],
    };

    await act(async () => {
      result.current.mutate(variables);
      await Promise.resolve();
    });

    expect(deleteMock).toHaveBeenCalledWith('event-1');
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['event', 'event-1'] });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['events'] });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['map-data'] });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['user-submissions'] });
    expect(revalidatePaths).toHaveBeenCalledWith([
      '/event/event-1-slug',
      '/',
      '/map/artist-1-slug',
    ]);
    expect(showToast.success).toHaveBeenCalledWith('刪除成功');
  });

  it('刪除失敗時顯示錯誤 toast，不 invalidate', async () => {
    const requestError = new Error('server error');
    deleteMock.mockRejectedValueOnce(requestError);

    const { result } = renderHook(() => useDeleteEventMutation());

    await act(async () => {
      result.current.mutate({ eventId: 'event-1' });
      await Promise.resolve();
    });

    expect(showToast.error).toHaveBeenCalledWith('server error');
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });
});
