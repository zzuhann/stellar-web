import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { venueApi, handleApiError } from '@/lib/api';
import type { CreateVenueData } from '@/types';

export function useCreateVenueMutation(options?: { onError?: (msg: string) => void }) {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateVenueData) => venueApi.createVenue(data),
    onSuccess: () => router.push('/admin-new/venues'),
    onError: (err) => options?.onError?.(handleApiError(err)),
  });
}
