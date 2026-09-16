import { describe, it, expect, vi } from 'vitest';
import { AxiosError } from 'axios';
import { useArtist } from './useArtist';

// useQuery 的 retry 是純函式邏輯，直接攔截 useQuery 拿到傳入的 options 來測，
// 不需要真的跑一個 QueryClient 出來重試。
let capturedOptions: { retry: (failureCount: number, error: Error) => boolean } | undefined;

vi.mock('@/lib/api', () => ({
  artistsApi: { getById: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: typeof capturedOptions) => {
    capturedOptions = options;
    return {};
  },
}));

function buildAxios401(): AxiosError {
  return new AxiosError(
    'Unauthorized',
    undefined,
    undefined,
    undefined,
    // response 只需要 retry 邏輯會讀的 status 欄位
    { status: 401 } as never
  );
}

describe('useArtist retry', () => {
  it('401 不重試——不能蓋掉 QueryProvider 的全域「401 不重試」規則，重試的請求會帶新的 auth generation，可能誤觸發多餘的登入提示', () => {
    useArtist('artist-1');

    expect(capturedOptions?.retry(1, buildAxios401())).toBe(false);
  });

  it('404（藝人不存在）不重試，維持原本客製化行為', () => {
    useArtist('artist-1');

    expect(capturedOptions?.retry(1, new Error('Artist not found'))).toBe(false);
  });

  it('其他錯誤最多重試 2 次，維持原本客製化行為', () => {
    useArtist('artist-1');

    expect(capturedOptions?.retry(1, new Error('network error'))).toBe(true);
    expect(capturedOptions?.retry(2, new Error('network error'))).toBe(false);
  });
});
