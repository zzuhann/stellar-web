import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import {
  getPlaceKind,
  hasMissingCoordinates,
  parsePlaceReselectError,
} from './venuePlaceReselectHelpers';

describe('getPlaceKind', () => {
  it.each([
    ['ChIJabc123', 'store', 'ChIJ'],
    ['EjabcDEF', 'address', 'Ejab'],
    ['EkabcDEF', 'address', 'Ekab'],
    ['', 'unset', ''],
    [null, 'unset', ''],
    [undefined, 'unset', ''],
    ['Xyz9abcdef', 'other', 'Xyz9'],
  ])('%s -> %s', (placeId, kind, prefix) => {
    expect(getPlaceKind(placeId)).toEqual({ kind, prefix });
  });
});

describe('hasMissingCoordinates', () => {
  it.each([
    [0, 0, true],
    [undefined, undefined, true],
    [null, 121, true],
    [25, undefined, true],
    [Number.NaN, 121, true],
    [25.04, 121.56, false],
    [0, 121.5, false],
  ])('(%s, %s) -> %s', (lat, lng, expected) => {
    expect(hasMissingCoordinates(lat, lng)).toBe(expected);
  });
});

describe('parsePlaceReselectError', () => {
  it('reads status, code and details from an axios error response', () => {
    const err = new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 409,
      statusText: '',
      headers: {},
      config: {} as never,
      data: { code: 'PLACE_ID_IN_USE', details: { venue: { id: 'v9', name: 'A' } } },
    });
    expect(parsePlaceReselectError(err)).toEqual({
      status: 409,
      code: 'PLACE_ID_IN_USE',
      details: { venue: { id: 'v9', name: 'A' } },
    });
  });

  it('returns an empty result for network and non-axios errors', () => {
    expect(parsePlaceReselectError(new AxiosError('Network Error'))).toEqual({});
    expect(parsePlaceReselectError(new Error('boom'))).toEqual({});
    expect(parsePlaceReselectError('oops')).toEqual({});
  });
});
