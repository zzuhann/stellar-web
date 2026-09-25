import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { artistsApi, eventsApi } from '@/lib/api';
import { revalidatePaths } from '@/lib/revalidate';
import showToast from '@/lib/toast';
import type { UpdateArtistRequest } from '@/types';

const artistKey = ['admin-new', 'review', 'artists'];
const eventKey = ['admin-new', 'review', 'events'];

export default function useAdminReview(tab: 'artists' | 'events') {
  const queryClient = useQueryClient();
  const artists = useQuery({
    queryKey: artistKey,
    queryFn: () => artistsApi.getAll({ status: 'pending', sortBy: 'createdAt', sortOrder: 'asc' }),
    enabled: tab === 'artists',
    staleTime: 30 * 1000,
  });
  const events = useQuery({
    queryKey: eventKey,
    queryFn: eventsApi.admin.getPending,
    enabled: tab === 'events',
    staleTime: 30 * 1000,
  });

  const artistMutation = useMutation({
    mutationFn: async (
      updates: Array<{
        artistId: string;
        status: 'approved' | 'rejected' | 'exists';
        groupNames?: string[];
        reason?: string;
      }>
    ) => {
      if (updates.length > 1) return artistsApi.batchReview(updates);

      if (updates[0].status === 'approved')
        await artistsApi.approve(updates[0].artistId, updates[0].groupNames);
      else
        await artistsApi.reject(updates[0].artistId, {
          reason: updates[0].reason || '藝人已存在',
        });

      // approve/reject 回傳 void，另外抓一次拿到 slug 才能 revalidate /map/[slug]；
      // 抓取失敗不擋審核成功流程，只是少清到這個藝人的頁面快取
      return artistsApi
        .getById(updates[0].artistId)
        .then((artist) => [artist])
        .catch(() => []);
    },
    onSuccess: (reviewedArtists) => {
      revalidatePaths([
        '/',
        ...reviewedArtists.flatMap((artist) => (artist.slug ? [`/map/${artist.slug}`] : [])),
      ]);
      queryClient.invalidateQueries({ queryKey: artistKey });
      queryClient.invalidateQueries({ queryKey: ['top-artists'] });
      showToast.success('審核完成');
    },
    onError: () => showToast.error('操作失敗，此筆資料可能已被其他管理員處理，請重新整理頁面'),
  });

  const editArtistMutation = useMutation({
    mutationFn: ({ artistId, data }: { artistId: string; data: UpdateArtistRequest }) =>
      artistsApi.update(artistId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: artistKey });
      showToast.success('藝人資料已更新');
    },
    onError: () => showToast.error('藝人資料更新失敗，請稍後再試'),
  });

  const eventMutation = useMutation({
    mutationFn: (
      updates: Array<{ eventId: string; status: 'approved' | 'rejected'; reason?: string }>
    ) =>
      updates.length === 1
        ? updates[0].status === 'approved'
          ? eventsApi.admin.approve(updates[0].eventId).then((event) => [event])
          : eventsApi.admin
              .reject(updates[0].eventId, { reason: updates[0].reason })
              .then((event) => [event])
        : eventsApi.admin.batchReview(updates),
    onSuccess: (reviewedEvents) => {
      revalidatePaths([
        '/',
        '/venues',
        ...reviewedEvents.flatMap((event) => [
          `/event/${event.slug ?? event.id}`,
          ...event.artists.map((artist) => `/map/${artist.slug ?? artist.id}`),
        ]),
      ]);
      queryClient.invalidateQueries({ queryKey: eventKey });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['home-venues'] });
      queryClient.invalidateQueries({ queryKey: ['top-artists'] });
      showToast.success('審核完成');
    },
    onError: () => showToast.error('操作失敗，此筆資料可能已被其他管理員處理，請重新整理頁面'),
  });

  return { artists, events, artistMutation, editArtistMutation, eventMutation };
}
