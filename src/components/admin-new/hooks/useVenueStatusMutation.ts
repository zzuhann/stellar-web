import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { venueApi, handleApiError } from '@/lib/api';
import queryKey from '@/hooks/queryKey';

export function useVenueStatusMutation(
  venueId: string,
  options?: { onError?: (msg: string) => void }
) {
  const [statusOverride, setStatusOverride] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: 'active' | 'inactive') => venueApi.updateVenue(venueId, { status }),
    onSuccess: (_, status) => {
      setStatusOverride(status);
      queryClient.invalidateQueries({ queryKey: queryKey.venueDetail(venueId) });
    },
    onError: (err) => options?.onError?.(handleApiError(err)),
  });

  return { mutation, statusOverride };
}
