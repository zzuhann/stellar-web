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
      // 同 useUpdateEventMutation：resubmit 會改動 status，['event', id] 快取也要清掉
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
