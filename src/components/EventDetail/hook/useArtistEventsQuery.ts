import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';

export function useArtistEventsQuery(artistId: string, currentEventId: string) {
  return useQuery({
    queryKey: queryKey.artistEvents(artistId),
    queryFn: async () => {
      const data = await eventsApi.getMapData({ artistId });
      // Exclude the current event from the related events list
      return data.events.filter((event) => event.id !== currentEventId);
    },
    enabled: !!artistId,
  });
}
