import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { CoffeeEvent } from '@/types';
import toast from '@/lib/toast';
import { sendGAEvent } from '@next/third-parties/google';
import { auth } from '@/lib/firebase';

interface UseFavoriteToggleOptions {
  eventId: string;
  isFavorited: boolean;
}

export const useFavoriteToggle = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

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
      toast.dismiss();
      toast.error('更新「我想去」失敗，請稍後再試');
    },
    onSuccess: (data) => {
      // Track only confirmed writes; auth.currentUser also covers the post-login path where the caller's user is stale
      sendGAEvent('event', data.isFavorited ? 'add_to_favorite' : 'remove_from_favorite', {
        event_page: '/event/[id]',
        user_id: auth.currentUser?.uid ?? '',
        content_id: data.eventId,
      });
      // 關閉所有 toast，避免快速點擊時出現多個 toast
      toast.dismiss();
      // Mark inactive lists stale before the notification can navigate to them.
      void queryClient.invalidateQueries({ queryKey: ['favorites'] });
      if (data.isFavorited) {
        toast.success('已加入「我想去」', {
          duration: 8000,
          action: {
            label: '查看',
            onClick: () => {
              toast.dismiss();
              router.push('/my-favorite');
            },
          },
        });
      } else {
        toast.success('已從「我想去」移除');
      }
    },
    onSettled: (_data, _error, { eventId }) => {
      // 重新 fetch 確保資料正確
      queryClient.invalidateQueries({ queryKey: ['favorite', eventId] });
    },
  });
};
