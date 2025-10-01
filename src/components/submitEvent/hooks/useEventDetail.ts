import { eventsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const useEventDetail = (editEventId: string) => {
  return useQuery({
    queryKey: ['event', editEventId],
    queryFn: () => eventsApi.getById(editEventId ?? ''),
    enabled: !!editEventId,
  });
};

export default useEventDetail;
