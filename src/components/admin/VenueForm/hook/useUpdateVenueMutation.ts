import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { venueApi } from '@/lib/api';
import { showToast } from '@/lib/toast';
import type { UpdateVenueData } from '@/types';

export function useUpdateVenueMutation(venueId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: UpdateVenueData) => venueApi.updateVenue(venueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      queryClient.invalidateQueries({ queryKey: ['venue-detail', venueId] });
      showToast.success('場地已更新');
      router.push('/admin/venues');
    },
    onError: () => {
      showToast.error('更新失敗，請再試一次');
    },
  });
}
