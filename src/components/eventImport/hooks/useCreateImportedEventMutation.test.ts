import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCreateImportedEventMutation } from './useCreateImportedEventMutation';
import { eventsApi, handleApiError } from '@/lib/api';
import showToast from '@/lib/toast';
import type { CreateEventRequest } from '@/types';

const pushMock = vi.fn();
const invalidateQueriesMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/lib/api', () => ({
  eventsApi: { create: vi.fn() },
  handleApiError: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

// 這支 hook 的重點不是「怎麼呼叫 API」（eventsApi.create 已有自己的測試），而是這個匯入頁面
// 專屬的成功/失敗處理：導回 /admin-new/events、invalidate 對應 query、toast 文案
// （見 hook 內註解：不重用 submitEvent 的 useCreateEventMutation，因為導頁語意不同）。
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

const createMock = vi.mocked(eventsApi.create);
const handleApiErrorMock = vi.mocked(handleApiError);

const buildEventData = (): CreateEventRequest => ({
  title: '活動標題',
  artistIds: ['artist-1'],
  description: '活動描述',
  datetime: {
    start: { _seconds: 0, _nanoseconds: 0 },
    end: { _seconds: 0, _nanoseconds: 0 },
  },
  location: {
    name: '場地',
    address: '地址',
    city: '台北市',
    coordinates: { lat: 25.033, lng: 121.5654 },
  },
  socialMedia: {},
  detailImage: [],
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useCreateImportedEventMutation', () => {
  it('建立成功後 invalidate 對應 query、顯示成功 toast、導回 /admin-new/events', async () => {
    createMock.mockResolvedValueOnce({ id: 'event-1' } as never);
    const { result } = renderHook(() => useCreateImportedEventMutation());

    await act(async () => {
      result.current.mutate(buildEventData());
      await Promise.resolve();
    });

    expect(createMock).toHaveBeenCalledWith(buildEventData());
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['events'] });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['map-data'] });
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['admin-events'] });
    expect(showToast.success).toHaveBeenCalledWith('活動建立成功，已進入待審核');
    expect(pushMock).toHaveBeenCalledWith('/admin-new/events');
  });

  it('建立失敗時顯示對應錯誤 toast，不導頁、不 invalidate', async () => {
    const requestError = new Error('server error');
    createMock.mockRejectedValueOnce(requestError);
    handleApiErrorMock.mockReturnValueOnce('建立活動失敗，請稍後再試');

    const { result } = renderHook(() => useCreateImportedEventMutation());

    await act(async () => {
      result.current.mutate(buildEventData());
      await Promise.resolve();
    });

    expect(handleApiErrorMock).toHaveBeenCalledWith(requestError, '建立活動失敗');
    expect(showToast.error).toHaveBeenCalledWith('建立活動失敗，請稍後再試');
    expect(pushMock).not.toHaveBeenCalled();
    expect(invalidateQueriesMock).not.toHaveBeenCalled();
  });
});
