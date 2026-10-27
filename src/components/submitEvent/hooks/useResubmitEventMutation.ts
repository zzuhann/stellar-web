import { eventsApi, handleApiError } from '@/lib/api';
import showToast from '@/lib/toast';
import { CoffeeEvent } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

type UseResubmitEventMutationProps = {
  // When given, the caller owns the redirect (e.g. admin edit returns to its list)
  onSuccess?: (event: CoffeeEvent) => void;
};

const useResubmitEventMutation = ({ onSuccess }: UseResubmitEventMutationProps = {}) => {
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

      if (onSuccess) onSuccess(updatedEvent);
      else router.push(`/my-submissions?tab=event`);
    },
    onError: (error) => {
      showToast.error(handleApiError(error, '重新送出審核時發生錯誤'));
    },
  });
};

export default useResubmitEventMutation;
