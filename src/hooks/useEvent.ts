import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';

// 獲取單一事件
export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id, // 只有當 id 存在時才執行
    staleTime: 1000 * 60 * 5, // 5 分鐘快取
    gcTime: 1000 * 60 * 15, // 15 分鐘保留
  });
};
