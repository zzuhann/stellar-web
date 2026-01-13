import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

// 取得單一事件
export const useEvent = (id: string) => {
  const { loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id && !authLoading, // 等 auth 準備好再發請求
    staleTime: 1000 * 60 * 5, // 5 分鐘快取
    gcTime: 1000 * 60 * 15, // 15 分鐘保留
  });
};
