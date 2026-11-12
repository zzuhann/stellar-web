import type { FavoritesResponse } from '@/types';
import { firebaseTimestampToDate } from '@/utils';

interface ListOptions {
  artistId: string;
  showOnlyActive: boolean;
  sortBy: 'favorited-desc' | 'favorited-asc' | 'startTime-asc' | 'startTime-desc';
  now?: number;
}

export function buildFavoriteList(
  favorites: FavoritesResponse['favorites'],
  { artistId, showOnlyActive, sortBy, now = Date.now() }: ListOptions
) {
  const unique = [...new Map(favorites.map((item) => [item.event.id, item])).values()];
  const artists = new Map<string, { id: string; name: string }>();
  for (const { event } of unique) {
    for (const artist of event.artists ?? []) artists.set(artist.id, artist);
  }
  const byName = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name, 'zh-Hant');
  const visible = unique.filter(
    ({ event }) =>
      (!artistId || event.artists?.some((artist) => artist.id === artistId)) &&
      (!showOnlyActive || firebaseTimestampToDate(event.datetime.end).getTime() >= now)
  );
  const timestamp = (item: FavoritesResponse['favorites'][number]) => {
    const value = sortBy.startsWith('startTime')
      ? item.event.datetime.start
      : item.favorite.createdAt;
    return value ? firebaseTimestampToDate(value).getTime() : 0;
  };
  visible.sort((a, b) => (timestamp(a) - timestamp(b)) * (sortBy.endsWith('desc') ? -1 : 1));
  return {
    events: visible.map(({ event }) => event),
    artists: [...artists.values()].sort(byName),
    total: visible.length,
  };
}
