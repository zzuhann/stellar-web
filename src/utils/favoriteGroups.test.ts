import { describe, expect, it } from 'vitest';
import { buildFavoriteGroups } from './favoriteGroups';
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

describe('favorite groups', () => {
  it('聯合應援分別出現，活動與組內去重，選單涵蓋完整清單', () => {
    const joint = item('joint', ['A', 'B', 'A']);
    const result = buildFavoriteGroups([joint, joint, item('solo', ['C'])], options);
    expect(result.total).toBe(2);
    expect(result.groups.map((g) => [g.id, g.events.map((e) => e.id)])).toEqual([
      ['A', ['joint']],
      ['B', ['joint']],
      ['C', ['solo']],
    ]);
    expect(result.artists).toHaveLength(3);
  });
  it('單選藝人不顯示聯合應援的其他組，但保留完整選單', () => {
    const result = buildFavoriteGroups([item('joint', ['A', 'B'])], { ...options, artistId: 'B' });
    expect(result.groups.map((g) => g.id)).toEqual(['B']);
    expect(result.total).toBe(1);
    expect(result.artists).toHaveLength(2);
  });
  it('截止時間相等仍顯示，過期活動篩掉但藝人留在選單', () => {
    const result = buildFavoriteGroups([item('ended', ['A'], 1, 199), item('now', ['B'])], {
      ...options,
      showOnlyActive: true,
    });
    expect(result.groups.map((g) => g.id)).toEqual(['B']);
    expect(result.artists).toHaveLength(2);
  });
  it('無效藝人為空結果，沒有藝人資料收在其他活動', () => {
    expect(buildFavoriteGroups([item('x', [])], options).groups[0].name).toBe('其他活動');
    expect(buildFavoriteGroups([item('x', ['A'])], { ...options, artistId: 'missing' }).total).toBe(
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
      expect(
        buildFavoriteGroups(items, { ...options, sortBy }).groups[0].events.map((e) => e.id)
      ).toEqual(expected);
    }
    expect(items.map((i) => i.event.id)).toEqual(['a', 'b']);
  });
});
