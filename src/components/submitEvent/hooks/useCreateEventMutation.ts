import { eventsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import showToast from '@/lib/toast';
import { CoffeeEvent, CreateEventRequest } from '@/types';
import emailjs from '@emailjs/browser';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

type UseCreateEventMutationProps = {
  onSuccess?: (event: CoffeeEvent) => void;
};

const useCreateEventMutation = ({ onSuccess }: UseCreateEventMutationProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { userData } = useAuth();

  return useMutation({
    mutationFn: (eventData: CreateEventRequest) => eventsApi.create(eventData),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('投稿成功');

      // 發送 EmailJS 通知
      if (userData && userData.role !== 'admin') {
        emailjs
          .send(
            'service_ufrmaop',
            'template_d1lxldp',
            {},
            {
              publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
            }
          )
          .catch(() => {});
      }

      onSuccess?.(newEvent);
      if (!onSuccess) {
        router.push('/my-submissions?tab=event');
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || '投稿失敗';
      showToast.error(errorMessage);
    },
  });
};

export default useCreateEventMutation;
