import { eventsApi } from '@/lib/api';
import { revalidatePaths } from '@/lib/revalidate';
import showToast from '@/lib/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type DeleteEventVariables = {
  eventId: string;
  slug?: string;
  artistSlugs?: string[];
};

const useDeleteEventMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId }: DeleteEventVariables) => eventsApi.delete(eventId),
    onSuccess: (_, { eventId, slug, artistSlugs = [] }) => {
      revalidatePaths([`/event/${slug ?? eventId}`, '/', ...artistSlugs.map((s) => `/map/${s}`)]);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      // 同 useUpdateEventMutation：這筆活動已經被刪除，useEventDetail 的
      // ['event', id] 快取要一併清掉，避免殘留舊資料讓後續查詢誤以為活動還存在
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      showToast.success('刪除成功');
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : '刪除時發生錯誤');
    },
  });
};

export default useDeleteEventMutation;
