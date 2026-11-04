import { useQuery } from '@tanstack/react-query';
import { venueApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';
import type { VenueTagDictionary } from '@/types';

// Cards wait for this, so a hung request must not keep the list on skeletons (venue-list-redesign)
const DICTIONARY_TIMEOUT_MS = 5000;

// dictionary stays null while pending and after a failure; isPending tells them apart
export function useVenueCardTagDictionary(): {
  dictionary: VenueTagDictionary | null;
  isPending: boolean;
} {
  const { data, isPending } = useQuery({
    queryKey: queryKey.venueTagDictionary(),
    queryFn: () => venueApi.getTagDictionary({ timeout: DICTIONARY_TIMEOUT_MS }),
    // Overrides the site-wide retry for this query only; a failure shows cards without tags
    retry: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  return { dictionary: data ?? null, isPending };
}
