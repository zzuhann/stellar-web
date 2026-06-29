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
      showToast.success('刪除成功');
    },
    onError: (error) => {
      showToast.error(error instanceof Error ? error.message : '刪除時發生錯誤');
    },
  });
};

export default useDeleteEventMutation;
