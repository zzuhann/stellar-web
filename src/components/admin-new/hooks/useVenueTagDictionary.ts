import { useQuery } from '@tanstack/react-query';
import { venueApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';

// Dictionary is a backend constant that only changes on deploy. No background refetch, so a
// flaky refetch mid-edit cannot suddenly disable the tag area
export function useVenueTagDictionary() {
  return useQuery({
    queryKey: queryKey.venueTagDictionary(),
    queryFn: () => venueApi.getTagDictionary(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
