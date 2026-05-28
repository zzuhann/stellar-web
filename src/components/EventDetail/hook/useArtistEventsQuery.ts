import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';

export function useArtistEventsQuery(artistId: string, currentEventId: string) {
  return useQuery({
    queryKey: queryKey.artistEvents(artistId),
    queryFn: () => eventsApi.getMapData({ artistId, status: 'all' }),
    select: (data) => data.events.filter((event) => event.id !== currentEventId),
    enabled: !!artistId,
    staleTime: 1000 * 60 * 5,
  });
}
