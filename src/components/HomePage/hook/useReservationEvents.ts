import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';

// Client-only on purpose: the list depends on "now", so it must never be baked into ISR HTML
export const useReservationEventsQuery = () => {
  return useQuery({
    queryKey: queryKey.reservationEvents(),
    queryFn: () => eventsApi.getReservations(),
    select: (data) => data.events,
  });
};
