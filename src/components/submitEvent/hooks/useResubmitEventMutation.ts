import { eventsApi } from '@/lib/api';
import showToast from '@/lib/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import emailjs from '@emailjs/browser';
import { useRouter } from 'next/navigation';

const useResubmitEventMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.resubmit(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['map-data'] });
      queryClient.invalidateQueries({ queryKey: ['user-submissions'] });
      showToast.success('已重新送出審核！');

      // 發送 EmailJS 通知
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

      router.push(`/my-submissions?tab=event`);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || '重新送出審核時發生錯誤';
      showToast.error(errorMessage);
    },
  });
};

export default useResubmitEventMutation;
