import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { venueApi, handleApiError } from '@/lib/api';
import queryKey from '@/hooks/queryKey';
import type { CreateVenueData } from '@/types';

export function useCreateVenueMutation(options?: { onError?: (msg: string) => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVenueData) => venueApi.createVenue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.adminVenues() });
      router.push('/admin-new/venues');
    },
    onError: (err) => options?.onError?.(handleApiError(err)),
  });
}
