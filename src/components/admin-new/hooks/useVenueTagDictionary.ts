import { useQuery } from '@tanstack/react-query';
import { venueApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';

// Dictionary only changes on deploy; the endpoint itself sends max-age=3600
export function useVenueTagDictionary() {
  return useQuery({
    queryKey: queryKey.venueTagDictionary(),
    queryFn: () => venueApi.getTagDictionary(),
    staleTime: 60 * 60 * 1000,
  });
}
