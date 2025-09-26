import { eventsApi } from '@/lib/api';
import showToast from '@/lib/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useDeleteEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.delete(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('刪除成功');
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : '刪除時發生錯誤');
    },
  });
};

export default useDeleteEventMutation;
