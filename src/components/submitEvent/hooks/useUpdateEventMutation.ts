import { eventsApi, handleApiError } from '@/lib/api';
import showToast from '@/lib/toast';
import { revalidatePaths } from '@/lib/revalidate';
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
      revalidatePaths([
        `/event/${updatedEvent.slug ?? updatedEvent.id}`,
        ...updatedEvent.artists.map((a) => `/map/${a.slug ?? a.id}`),
      ]);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('更新成功');
      onSuccess?.(updatedEvent);
    },
    onError: (error) => {
      showToast.error(handleApiError(error, '更新失敗'));
    },
  });
};

export default useUpdateEventMutation;
