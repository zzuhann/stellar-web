import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '@/lib/api';
import { Artist } from '@/types';

// 取得單一藝人資料的 Hook
export const useArtist = (id: string) => {
  return useQuery<Artist, Error>({
    queryKey: ['artist', id],
    queryFn: () => artistsApi.getById(id),
    enabled: !!id, // 只有當 id 存在時才執行查詢
    staleTime: 5 * 60 * 1000, // 5 分鐘內資料被視為新鮮
    gcTime: 10 * 60 * 1000, // React Query v5 使用 gcTime 替代 cacheTime
    retry: (failureCount, error) => {
      // 如果是 404 錯誤（藝人不存在），不重試
      if (error.message === 'Artist not found') {
        return false;
      }
      // 其他錯誤最多重試 2 次
      return failureCount < 2;
    },
  });
};
