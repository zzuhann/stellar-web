import { usersApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export const SUBMISSIONS_PAGE_LIMIT = 20;

export function useMySubmittedEvents(page: number, enabled: boolean) {
  return useQuery({
    queryKey: ['user-submissions', 'events', page],
    queryFn: () => usersApi.submissions.getEvents({ page, limit: SUBMISSIONS_PAGE_LIMIT }),
    enabled,
  });
}

export function useMySubmittedArtists(page: number, enabled: boolean) {
  return useQuery({
    queryKey: ['user-submissions', 'artists', page],
    queryFn: () => usersApi.submissions.getArtists({ page, limit: SUBMISSIONS_PAGE_LIMIT }),
    enabled,
  });
}
