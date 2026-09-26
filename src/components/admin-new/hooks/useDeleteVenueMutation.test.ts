import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDeleteVenueMutation } from './useDeleteVenueMutation';
import { venueApi, handleApiError } from '@/lib/api';
import { revalidatePublicPages } from '@/lib/revalidate';

const invalidateQueriesMock = vi.fn();
const pushMock = vi.fn();

vi.mock('@/lib/api', () => ({
  venueApi: { permanentDeleteVenue: vi.fn() },
  handleApiError: vi.fn(),
}));

vi.mock('@/lib/revalidate', () => ({
  revalidatePublicPages: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/hooks/queryKey', () => ({
  default: { adminVenues: () => ['admin-venues'] },
}));

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

const permanentDeleteVenueMock = vi.mocked(venueApi.permanentDeleteVenue);
const handleApiErrorMock = vi.mocked(handleApiError);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDeleteVenueMutation', () => {
  it('刪除成功後清全部公開頁快取，並導回場地列表', async () => {
    permanentDeleteVenueMock.mockResolvedValueOnce({ message: 'ok' });

    const { result } = renderHook(() => useDeleteVenueMutation('venue-1'));

    await act(async () => {
      result.current.mutate();
      await Promise.resolve();
    });

    expect(permanentDeleteVenueMock).toHaveBeenCalledWith('venue-1');
    expect(revalidatePublicPages).toHaveBeenCalledTimes(1);
    expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ['admin-venues'] });
    expect(pushMock).toHaveBeenCalledWith('/admin-new/venues');
  });

  it('刪除失敗時呼叫 onError，不清快取、不導頁', async () => {
    const requestError = new Error('server error');
    permanentDeleteVenueMock.mockRejectedValueOnce(requestError);
    handleApiErrorMock.mockReturnValueOnce('刪除失敗，請稍後再試');
    const onError = vi.fn();

    const { result } = renderHook(() => useDeleteVenueMutation('venue-1', { onError }));

    await act(async () => {
      result.current.mutate();
      await Promise.resolve();
    });

    expect(onError).toHaveBeenCalledWith('刪除失敗，請稍後再試');
    expect(revalidatePublicPages).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
