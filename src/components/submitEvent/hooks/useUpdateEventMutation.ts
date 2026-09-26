import { eventsApi, handleApiError } from '@/lib/api';
import showToast from '@/lib/toast';
import { revalidatePublicPages } from '@/lib/revalidate';
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
      revalidatePublicPages();
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['home-venues'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      // ['event', id]（單數）跟上面的 ['events']（複數）是不同 key，需另外 invalidate，
      // 否則編輯存檔後再次打開同一筆會抓到舊快取
      queryClient.invalidateQueries({ queryKey: ['event', updatedEvent.id] });
      showToast.success('更新成功');
      onSuccess?.(updatedEvent);
    },
    onError: (error) => {
      showToast.error(handleApiError(error, '更新失敗'));
    },
  });
};

export default useUpdateEventMutation;
