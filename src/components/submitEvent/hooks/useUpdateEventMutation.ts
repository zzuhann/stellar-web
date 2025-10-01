import { eventsApi } from '@/lib/api';
import showToast from '@/lib/toast';
import { CoffeeEvent, UpdateEventRequest } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type UseUpdateEventMutationProps = {
  onSuccess?: (event: CoffeeEvent) => void;
};

const useUpdateEventMutation = ({ onSuccess }: UseUpdateEventMutationProps) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventRequest }) =>
      eventsApi.update(id, data),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('更新成功');
      onSuccess?.(updatedEvent);
    },
    onError: (error: any) => {
      // 從後端錯誤回應中提取錯誤訊息
      const errorMessage = error?.response?.data?.error || '更新失敗';
      showToast.error(errorMessage);
    },
  });
};

export default useUpdateEventMutation;
