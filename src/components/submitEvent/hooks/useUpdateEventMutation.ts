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
      // useEventDetail（編輯/複製表單讀取活動資料用）的 key 是 ['event', id]（單數），
      // 跟上面的 ['events']（複數）是完全不同的 key，react-query 不會模糊比對前綴，
      // 沒有這行的話，編輯存檔後再次打開同一筆會抓到編輯前的舊快取
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
