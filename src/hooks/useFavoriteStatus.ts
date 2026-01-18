import { usersApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';

const useFavoriteStatus = (eventId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favorite', eventId],
    queryFn: () => usersApi.favorites.check(eventId),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 分鐘快取
  });
};

export default useFavoriteStatus;
