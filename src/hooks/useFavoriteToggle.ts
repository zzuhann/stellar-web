import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { CoffeeEvent } from '@/types';
import toast from '@/lib/toast';
import { toast as reactHotToast } from 'react-hot-toast';

interface UseFavoriteToggleOptions {
  eventId: string;
  isFavorited: boolean;
}

export const useFavoriteToggle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, isFavorited }: UseFavoriteToggleOptions) => {
      if (isFavorited) {
        await usersApi.favorites.remove(eventId);
        return { eventId, isFavorited: false };
      } else {
        await usersApi.favorites.add(eventId);
        return { eventId, isFavorited: true };
      }
    },
    onMutate: async ({ eventId, isFavorited }) => {
      // 取消進行中的 query 避免覆蓋 optimistic update
      await queryClient.cancelQueries({ queryKey: ['favorite', eventId] });

      // 取得目前快取的 event 資料
      const previousEvent = queryClient.getQueryData<CoffeeEvent>(['favorite', eventId]);

      // Optimistic update
      if (previousEvent) {
        queryClient.setQueryData<CoffeeEvent>(['favorite', eventId], {
          ...previousEvent,
          isFavorited: !isFavorited,
        });
      }

      return { previousEvent };
    },
    onError: (_error, { eventId }, context) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(['favorite', eventId], context.previousEvent);
      }
      // 關閉所有 toast，避免快速點擊時出現多個 toast
      reactHotToast.dismiss();
      toast.error('收藏生日應援失敗，請稍後再試');
    },
    onSuccess: (data) => {
      // 關閉所有 toast，避免快速點擊時出現多個 toast
      reactHotToast.dismiss();
      const message = data.isFavorited ? '已加入收藏' : '已取消收藏';
      toast.success(message);
    },
    onSettled: (_data, _error, { eventId }) => {
      // 重新 fetch 確保資料正確
      queryClient.invalidateQueries({ queryKey: ['favorite', eventId] });
    },
  });
};
