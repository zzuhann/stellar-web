import { eventsApi, handleApiError } from '@/lib/api';
import showToast from '@/lib/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const useResubmitEventMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.resubmit(eventId),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      // 同 useUpdateEventMutation：resubmit 也會改動這筆活動的資料（status），
      // useEventDetail 的 ['event', id] 快取要一併清掉，見那邊的註解
      queryClient.invalidateQueries({ queryKey: ['event', updatedEvent.id] });
      showToast.success('已重新送出審核！');

      router.push(`/my-submissions?tab=event`);
    },
    onError: (error) => {
      showToast.error(handleApiError(error, '重新送出審核時發生錯誤'));
    },
  });
};

export default useResubmitEventMutation;
