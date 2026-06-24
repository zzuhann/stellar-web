import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { venueApi, handleApiError } from '@/lib/api';
import { revalidatePaths } from '@/lib/revalidate';
import queryKey from '@/hooks/queryKey';
import type { UpdateVenueData } from '@/types';

export function useUpdateVenueMutation(
  venueId: string,
  options?: { onError?: (msg: string) => void }
) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateVenueData) => venueApi.updateVenue(venueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.venueDetail(venueId) });
      queryClient.invalidateQueries({ queryKey: ['admin-venues'] });
      revalidatePaths(['/venues', `/venues/${venueId}`]);
      router.push('/admin-new/venues');
    },
    onError: (err) => options?.onError?.(handleApiError(err)),
  });
}
