import { describe, expect, it } from 'vitest';
import queryKey from './queryKey';

describe('queryKey.mapData', () => {
  // TC-022 (a)
  it('fills status=all and search="" so server prefetch and client hook share one key', () => {
    expect(queryKey.mapData({ artistId: 'a1' })).toEqual([
      'map-data',
      { status: 'all', search: '', artistId: 'a1' },
    ]);
  });
});
