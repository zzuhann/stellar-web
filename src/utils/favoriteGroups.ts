import type { CoffeeEvent, FavoritesResponse } from '@/types';
import { firebaseTimestampToDate } from '@/utils';

export interface FavoriteGroup {
  id: string;
  name: string;
  events: CoffeeEvent[];
}

interface GroupOptions {
  artistId: string;
  showOnlyActive: boolean;
  sortBy: 'favorited-desc' | 'favorited-asc' | 'startTime-asc' | 'startTime-desc';
  now?: number;
}

export function buildFavoriteGroups(
  favorites: FavoritesResponse['favorites'],
  { artistId, showOnlyActive, sortBy, now = Date.now() }: GroupOptions
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
  const groups = new Map<string, FavoriteGroup>();
  for (const { event } of visible) {
    const eventArtists = event.artists?.length ? event.artists : [{ id: '', name: '其他活動' }];
    for (const artist of new Map(eventArtists.map((artist) => [artist.id, artist])).values()) {
      if (artistId && artist.id !== artistId) continue;
      const group = groups.get(artist.id) ?? { id: artist.id, name: artist.name, events: [] };
      group.events.push(event);
      groups.set(artist.id, group);
    }
  }
  return {
    groups: [...groups.values()].sort(byName),
    artists: [...artists.values()].sort(byName),
    total: visible.length,
  };
}
