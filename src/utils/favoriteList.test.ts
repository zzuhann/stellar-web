import { describe, expect, it } from 'vitest';
import { buildFavoriteList } from './favoriteList';
import type { FavoritesResponse } from '@/types';

function item(id: string, artistIds: string[], start = 100, end = 200, added = 50) {
  return {
    favorite: { createdAt: { _seconds: added, _nanoseconds: 0 } },
    event: {
      id,
      artists: artistIds.map((id) => ({ id, name: id })),
      datetime: {
        start: { _seconds: start, _nanoseconds: 0 },
        end: { _seconds: end, _nanoseconds: 0 },
      },
    },
  } as FavoritesResponse['favorites'][number];
}
const options = {
  artistId: '',
  showOnlyActive: false,
  sortBy: 'favorited-desc' as const,
  now: 200000,
};

describe('favorite list', () => {
  it('全部混排且聯合應援只出現一次，選單涵蓋完整清單', () => {
    const joint = item('joint', ['A', 'B', 'A']);
    const result = buildFavoriteList([joint, joint, item('solo', ['C'])], options);
    expect(result.total).toBe(2);
    expect(result.events.map((event) => event.id)).toEqual(['joint', 'solo']);
    expect(result.artists).toHaveLength(3);
  });
  it('選任何相關藝人都找得到聯合應援，並保留完整選單', () => {
    const result = buildFavoriteList([item('joint', ['A', 'B'])], { ...options, artistId: 'B' });
    expect(result.events.map((event) => event.id)).toEqual(['joint']);
    expect(result.total).toBe(1);
    expect(result.artists).toHaveLength(2);
  });
  it('截止時間相等仍顯示，過期活動篩掉但藝人留在選單', () => {
    const result = buildFavoriteList([item('ended', ['A'], 1, 199), item('now', ['B'])], {
      ...options,
      showOnlyActive: true,
    });
    expect(result.events.map((event) => event.id)).toEqual(['now']);
    expect(result.artists).toHaveLength(2);
  });
  it('無效藝人為空結果，沒有藝人資料仍保留在全部', () => {
    expect(buildFavoriteList([item('x', [])], options).events[0].id).toBe('x');
    expect(buildFavoriteList([item('x', ['A'])], { ...options, artistId: 'missing' }).total).toBe(
      0
    );
  });
  it('四種時間排序且不修改原資料', () => {
    const items = [item('a', ['A'], 100, 200, 80), item('b', ['A'], 50, 200, 90)];
    for (const [sortBy, expected] of [
      ['favorited-desc', ['b', 'a']],
      ['favorited-asc', ['a', 'b']],
      ['startTime-asc', ['b', 'a']],
      ['startTime-desc', ['a', 'b']],
    ] as const) {
      expect(buildFavoriteList(items, { ...options, sortBy }).events.map((e) => e.id)).toEqual(
        expected
      );
    }
    expect(items.map((i) => i.event.id)).toEqual(['a', 'b']);
  });
});
