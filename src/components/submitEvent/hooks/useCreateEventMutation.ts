import { eventsApi, handleApiError } from '@/lib/api';
import showToast from '@/lib/toast';
import { CoffeeEvent, CreateEventRequest } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { sendGAEvent } from '@next/third-parties/google';

type UseCreateEventMutationProps = {
  onSuccess?: (event: CoffeeEvent) => void;
  // Recorded when the page mounted (not read at submit time), so swapping artists doesn't change it.
  entryPoint?: 'submit_artist_page';
};

const useCreateEventMutation = ({ onSuccess, entryPoint }: UseCreateEventMutationProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (eventData: CreateEventRequest) => eventsApi.create(eventData),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });

      sendGAEvent('event', 'submit_event', {
        event_page: '/submit-event',
        user_id: user?.uid ?? '',
        content_id: newEvent.id,
        ...(entryPoint ? { entry_point: entryPoint } : {}),
      });

      showToast.success('投稿成功');

      onSuccess?.(newEvent);
      if (!onSuccess) {
        router.push('/my-submissions?tab=event');
      }
    },
    onError: (error) => {
      showToast.error(handleApiError(error, '投稿失敗'));
    },
  });
};

export default useCreateEventMutation;
