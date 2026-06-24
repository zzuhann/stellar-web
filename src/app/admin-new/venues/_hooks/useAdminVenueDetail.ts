import { useQuery } from '@tanstack/react-query';
import { venueApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';

export function useAdminVenueDetail(venueId: string) {
  return useQuery({
    queryKey: queryKey.venueDetail(venueId),
    queryFn: () => venueApi.getAdminVenueById(venueId),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000,
  });
}
