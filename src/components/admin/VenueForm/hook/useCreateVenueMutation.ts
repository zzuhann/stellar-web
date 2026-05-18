import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { venueApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import type { CreateVenueData } from '@/types';

export function useCreateVenueMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateVenueData) => venueApi.createVenue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      showToast.success('場地已新增');
      router.push('/admin/venues');
    },
    onError: () => {
      showToast.error('新增失敗，請再試一次');
    },
  });
}
