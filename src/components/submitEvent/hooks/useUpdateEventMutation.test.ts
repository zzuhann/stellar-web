import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useUpdateEventMutation from './useUpdateEventMutation';
import { eventsApi, handleApiError } from '@/lib/api';
import { revalidatePaths } from '@/lib/revalidate';
import showToast from '@/lib/toast';
import type { CoffeeEvent, UpdateEventRequest } from '@/types';

const invalidateQueriesMock = vi.fn();

vi.mock('@/lib/api', () => ({
  eventsApi: { update: vi.fn() },
  handleApiError: vi.fn(),
}));

vi.mock('@/lib/revalidate', () => ({
  revalidatePaths: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

// 回歸測試：['event', id]（單數）跟 ['events']（複數）是不同 key，沒有明確 invalidate
// 前者的話，編輯活動存檔後再次編輯同一筆會抓到舊快取
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

const updateMock = vi.mocked(eventsApi.update);
const handleApiErrorMock = vi.mocked(handleApiError);

const buildUpdatedEvent = (): CoffeeEvent =>
  ({
    id: 'event-1',
    slug: 'event-1-slug',
    artists: [{ id: 'artist-1', slug: 'artist-1-slug', name: '藝人' }],
  }) as CoffeeEvent;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useUpdateEventMutation', () => {
  it('更新成功後 invalidate ["event", id]，讓再次編輯同一筆能抓到新資料', async () => {
    const updatedEvent = buildUpdatedEvent();
    updateMock.mockResolvedValueOnce(updatedEvent);

    const { result } = renderHook(() => useUpdateEventMutation({}));

    await act(async () => {
      result.current.mutate({ id: 'event-1', data: {} as UpdateEventRequest });
      await Promise.resolve();
    });

    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['event', 'event-1'] });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['events'] });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['map-data'] });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['user-submissions'] });
    expect(showToast.success).toHaveBeenCalledWith('更新成功');
  });

  it('更新成功後也會 revalidate 活動與藝人頁面路徑', async () => {
    const updatedEvent = buildUpdatedEvent();
    updateMock.mockResolvedValueOnce(updatedEvent);

    const { result } = renderHook(() => useUpdateEventMutation({}));

    await act(async () => {
      result.current.mutate({ id: 'event-1', data: {} as UpdateEventRequest });
      await Promise.resolve();
    });

    expect(revalidatePaths).toHaveBeenCalledWith(['/event/event-1-slug', '/map/artist-1-slug']);
  });

  it('更新失敗時顯示錯誤 toast，不 invalidate', async () => {
    const requestError = new Error('server error');
    updateMock.mockRejectedValueOnce(requestError);
    handleApiErrorMock.mockReturnValueOnce('更新失敗，請稍後再試');

    const { result } = renderHook(() => useUpdateEventMutation({}));

    await act(async () => {
      result.current.mutate({ id: 'event-1', data: {} as UpdateEventRequest });
      await Promise.resolve();
    });

    expect(handleApiErrorMock).toHaveBeenCalledWith(requestError, '更新失敗');
    expect(showToast.error).toHaveBeenCalledWith('更新失敗，請稍後再試');
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });
});
