import { eventsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const useUserSubmissions = (enabled: boolean) => {
  return useQuery({
    queryKey: ['user-submissions'],
    queryFn: eventsApi.getMySubmissions,
    enabled,
  });
};

export default useUserSubmissions;
