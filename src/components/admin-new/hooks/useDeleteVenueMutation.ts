import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { venueApi, handleApiError } from '@/lib/api';
import queryKey from '@/hooks/queryKey';

export function useDeleteVenueMutation(
  venueId: string,
  options?: { onError?: (msg: string) => void }
) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => venueApi.permanentDeleteVenue(venueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.adminVenues() });
      router.push('/admin-new/venues');
    },
    onError: (err) => options?.onError?.(handleApiError(err)),
  });
}
