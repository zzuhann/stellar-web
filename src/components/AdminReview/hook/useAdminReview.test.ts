import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useAdminReview from './useAdminReview';
import { artistsApi } from '@/lib/api';
import { revalidatePaths } from '@/lib/revalidate';
import showToast from '@/lib/toast';
import type { Artist } from '@/types';

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
  revalidatePaths: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

// artistMutation 的 approve/reject API 回傳 void，revalidate /map/[slug] 需要的 slug
// 要另外打 getById 拿；這裡 mock useMutation 讓 mutationFn 真的跑完再進 onSuccess，
// 才能驗證這條「approve 後補抓 slug 再 revalidate」的路徑有正確運作。
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
const getByIdMock = vi.mocked(artistsApi.getById);
const batchReviewMock = vi.mocked(artistsApi.batchReview);

const buildArtist = (overrides: Partial<Artist> = {}): Artist =>
  ({
    id: 'artist-1',
    slug: 'artist-1-slug',
    stageName: '藝人',
    ...overrides,
  }) as Artist;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAdminReview artistMutation', () => {
  it('核准單一藝人成功後，revalidate 首頁與該藝人的地圖頁', async () => {
    approveMock.mockResolvedValueOnce(undefined);
    getByIdMock.mockResolvedValueOnce(
      buildArtist() as unknown as Awaited<ReturnType<typeof artistsApi.getById>>
    );

    const { result } = renderHook(() => useAdminReview('artists'));

    await act(async () => {
      result.current.artistMutation.mutate([{ artistId: 'artist-1', status: 'approved' }]);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(approveMock).toHaveBeenCalledWith('artist-1', undefined);
    expect(getByIdMock).toHaveBeenCalledWith('artist-1');
    expect(revalidatePaths).toHaveBeenCalledWith(['/', '/map/artist-1-slug']);
    expect(showToast.success).toHaveBeenCalledWith('審核完成');
  });

  it('拒絕單一藝人成功後，也會 revalidate 首頁與該藝人的地圖頁', async () => {
    rejectMock.mockResolvedValueOnce(undefined);
    getByIdMock.mockResolvedValueOnce(
      buildArtist({ id: 'artist-2', slug: 'artist-2-slug' }) as unknown as Awaited<
        ReturnType<typeof artistsApi.getById>
      >
    );

    const { result } = renderHook(() => useAdminReview('artists'));

    await act(async () => {
      result.current.artistMutation.mutate([
        { artistId: 'artist-2', status: 'rejected', reason: '不符合規則' },
      ]);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(rejectMock).toHaveBeenCalledWith('artist-2', { reason: '不符合規則' });
    expect(revalidatePaths).toHaveBeenCalledWith(['/', '/map/artist-2-slug']);
  });

  it('批次審核成功後，revalidate 首頁與所有有 slug 的藝人地圖頁', async () => {
    batchReviewMock.mockResolvedValueOnce([
      buildArtist({ id: 'artist-1', slug: 'artist-1-slug' }),
      buildArtist({ id: 'artist-2', slug: undefined }),
    ]);

    const { result } = renderHook(() => useAdminReview('artists'));

    await act(async () => {
      result.current.artistMutation.mutate([
        { artistId: 'artist-1', status: 'approved' },
        { artistId: 'artist-2', status: 'rejected' },
      ]);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(batchReviewMock).toHaveBeenCalled();
    expect(getByIdMock).not.toHaveBeenCalled();
    expect(revalidatePaths).toHaveBeenCalledWith(['/', '/map/artist-1-slug']);
  });

  it('補抓 slug 的 getById 失敗時，仍完成審核並只 revalidate 首頁', async () => {
    approveMock.mockResolvedValueOnce(undefined);
    getByIdMock.mockRejectedValueOnce(new Error('network error'));

    const { result } = renderHook(() => useAdminReview('artists'));

    await act(async () => {
      result.current.artistMutation.mutate([{ artistId: 'artist-1', status: 'approved' }]);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(revalidatePaths).toHaveBeenCalledWith(['/']);
    expect(showToast.success).toHaveBeenCalledWith('審核完成');
  });

  it('審核 API 失敗時顯示錯誤 toast，不 revalidate', async () => {
    approveMock.mockRejectedValueOnce(new Error('server error'));

    const { result } = renderHook(() => useAdminReview('artists'));

    await act(async () => {
      result.current.artistMutation.mutate([{ artistId: 'artist-1', status: 'approved' }]);
      await Promise.resolve();
    });

    expect(showToast.error).toHaveBeenCalledWith(
      '操作失敗，此筆資料可能已被其他管理員處理，請重新整理頁面'
    );
    expect(revalidatePaths).not.toHaveBeenCalled();
  });
});
