import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useAdminReview from './useAdminReview';
import { artistsApi } from '@/lib/api';
import { revalidatePublicPages } from '@/lib/revalidate';
import showToast from '@/lib/toast';

const invalidateQueriesMock = vi.fn();

vi.mock('@/lib/api', () => ({
  artistsApi: {
    getAll: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    getById: vi.fn(),
    batchReview: vi.fn(),
    update: vi.fn(),
  },
  eventsApi: {
    admin: {
      getPending: vi.fn(),
      approve: vi.fn(),
      reject: vi.fn(),
      batchReview: vi.fn(),
    },
  },
}));

vi.mock('@/lib/revalidate', () => ({
  revalidatePublicPages: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
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
  useQuery: () => ({ data: undefined, isLoading: false, isError: false, refetch: vi.fn() }),
  useQueryClient: () => ({ invalidateQueries: invalidateQueriesMock }),
}));

const approveMock = vi.mocked(artistsApi.approve);
const rejectMock = vi.mocked(artistsApi.reject);
const batchReviewMock = vi.mocked(artistsApi.batchReview);
const updateMock = vi.mocked(artistsApi.update);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAdminReview artistMutation', () => {
  it('核准單一藝人成功後，清全部公開頁快取', async () => {
    approveMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAdminReview('artists'));

    await act(async () => {
      result.current.artistMutation.mutate([{ artistId: 'artist-1', status: 'approved' }]);
      await Promise.resolve();
    });

    expect(approveMock).toHaveBeenCalledWith('artist-1', undefined);
    expect(revalidatePublicPages).toHaveBeenCalledTimes(1);
    expect(showToast.success).toHaveBeenCalledWith('審核完成');
  });

  it('拒絕單一藝人成功後，也會清全部公開頁快取', async () => {
    rejectMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAdminReview('artists'));

    await act(async () => {
      result.current.artistMutation.mutate([
        { artistId: 'artist-2', status: 'rejected', reason: '不符合規則' },
      ]);
      await Promise.resolve();
    });

    expect(rejectMock).toHaveBeenCalledWith('artist-2', { reason: '不符合規則' });
    expect(revalidatePublicPages).toHaveBeenCalledTimes(1);
  });

  it('批次審核成功後，清全部公開頁快取', async () => {
    batchReviewMock.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAdminReview('artists'));

    await act(async () => {
      result.current.artistMutation.mutate([
        { artistId: 'artist-1', status: 'approved' },
        { artistId: 'artist-2', status: 'rejected' },
      ]);
      await Promise.resolve();
    });

    expect(batchReviewMock).toHaveBeenCalled();
    expect(revalidatePublicPages).toHaveBeenCalledTimes(1);
  });

  it('審核 API 失敗時顯示錯誤 toast，不清快取', async () => {
    approveMock.mockRejectedValueOnce(new Error('server error'));

    const { result } = renderHook(() => useAdminReview('artists'));

    await act(async () => {
      result.current.artistMutation.mutate([{ artistId: 'artist-1', status: 'approved' }]);
      await Promise.resolve();
    });

    expect(showToast.error).toHaveBeenCalledWith(
      '操作失敗，此筆資料可能已被其他管理員處理，請重新整理頁面'
    );
    expect(revalidatePublicPages).not.toHaveBeenCalled();
  });
});

describe('useAdminReview editArtistMutation', () => {
  it('編輯藝人成功後，清全部公開頁快取（本人投稿編輯與 admin-new 編輯共用）', async () => {
    updateMock.mockResolvedValueOnce(
      undefined as unknown as Awaited<ReturnType<typeof artistsApi.update>>
    );

    const { result } = renderHook(() => useAdminReview('artists'));

    await act(async () => {
      result.current.editArtistMutation.mutate({
        artistId: 'artist-1',
        data: { stageName: '新藝名' },
      });
      await Promise.resolve();
    });

    expect(updateMock).toHaveBeenCalledWith('artist-1', { stageName: '新藝名' });
    expect(revalidatePublicPages).toHaveBeenCalledTimes(1);
    expect(showToast.success).toHaveBeenCalledWith('藝人資料已更新');
  });

  it('編輯藝人失敗時不清快取', async () => {
    updateMock.mockRejectedValueOnce(new Error('server error'));

    const { result } = renderHook(() => useAdminReview('artists'));

    await act(async () => {
      result.current.editArtistMutation.mutate({ artistId: 'artist-1', data: {} });
      await Promise.resolve();
    });

    expect(showToast.error).toHaveBeenCalledWith('藝人資料更新失敗，請稍後再試');
    expect(revalidatePublicPages).not.toHaveBeenCalled();
  });
});
