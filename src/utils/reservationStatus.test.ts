import { afterEach, describe, expect, it } from 'vitest';
import {
  buildReservationList,
  formatReservationOpenTime,
  getReservationLabel,
} from './reservationStatus';
import type { ReservationEventItem } from '@/types';

const NOW = new Date('2026-11-20T04:00:00Z'); // Taipei 11/20 12:00
const ts = (iso: string) => ({
  _seconds: Math.floor(new Date(iso).getTime() / 1000),
  _nanoseconds: 0,
});

describe('getReservationLabel (TC-008)', () => {
  const upcoming = ts('2026-11-21T06:00:00Z'); // Taipei 11/21（六）14:00

  it.each([
    ['未來', upcoming, '11/21（六）14:00 開放預約'],
    ['等於 now', { _seconds: NOW.getTime() / 1000, _nanoseconds: 0 }, '已開放預約'],
    ['過去', ts('2026-11-19T00:00:00Z'), '已開放預約'],
    ['未填', undefined, '已開放預約'],
  ])('%s', (_name, startAt, expected) => {
    expect(getReservationLabel(startAt, NOW).text).toBe(expected);
    expect(expected).not.toMatch(/可預約/);
  });

  it('kind 區分即將開放與已開放', () => {
    expect(getReservationLabel(upcoming, NOW).kind).toBe('upcoming');
    expect(getReservationLabel(undefined, NOW).kind).toBe('open');
  });
});

describe('formatReservationOpenTime (TC-010, TC-025)', () => {
  const originalTZ = process.env.TZ;
  afterEach(() => {
    if (originalTZ === undefined) delete process.env.TZ;
    else process.env.TZ = originalTZ;
  });

  describe.each(['America/Los_Angeles', 'UTC', 'Asia/Taipei'])('TZ=%s', (tz) => {
    it.each([
      ['2026-11-20T16:30:00Z', '11/21（六）00:30'],
      ['2026-11-21T06:00:00Z', '11/21（六）14:00'],
      ['2026-12-31T17:00:00Z', '1/1（五）01:00'],
      // 午夜必須是 00:00，不是 24:00
      ['2026-11-20T16:00:00Z', '11/21（六）00:00'],
    ])('%s -> %s', (iso, expected) => {
      process.env.TZ = tz;
      expect(formatReservationOpenTime(ts(iso))).toBe(expected);
    });
  });
});

describe('非法 startAt 視為未填 (TC-023)', () => {
  it.each([
    ['null', null],
    ['空物件', {}],
    ['NaN seconds', { _seconds: NaN, _nanoseconds: 0 }],
    ['字串', 'not-a-date'],
    ['seconds 為字串', { _seconds: 'abc', _nanoseconds: 0 }],
    ['超出範圍', { _seconds: 1e20, _nanoseconds: 0 }],
  ])('%s 不拋錯、回已開放預約', (_name, startAt) => {
    expect(() => getReservationLabel(startAt, NOW)).not.toThrow();
    expect(getReservationLabel(startAt, NOW)).toEqual({
      kind: 'open',
      text: '已開放預約',
    });
    expect(getReservationLabel(startAt, NOW).text).toBe('已開放預約');
  });
});

const makeEvent = (
  id: string,
  opts: {
    start?: string;
    end?: string;
    startAt?: string;
    url?: string;
  } = {}
): ReservationEventItem => ({
  id,
  slug: id,
  title: id,
  datetime: {
    start: ts(opts.start ?? '2026-11-25T00:00:00Z'),
    end: ts(opts.end ?? '2026-11-30T00:00:00Z'),
  },
  artists: [],
  reservation: {
    url: opts.url ?? 'https://example.com',
    ...(opts.startAt ? { startAt: ts(opts.startAt) } : {}),
  },
});

describe('buildReservationList (TC-021 的收錄與排序基礎)', () => {
  it('即將開放在前（startAt 升冪），已開放依活動開始時間升冪', () => {
    const list = buildReservationList(
      [
        makeEvent('open-late', { start: '2026-11-28T00:00:00Z' }),
        makeEvent('up-2', { startAt: '2026-11-22T00:00:00Z' }),
        makeEvent('open-early', { start: '2026-11-19T00:00:00Z', startAt: '2026-11-18T00:00:00Z' }),
        makeEvent('up-1', { startAt: '2026-11-21T00:00:00Z' }),
      ],
      NOW
    );
    expect(list.map((e) => e.id)).toEqual(['up-1', 'up-2', 'open-early', 'open-late']);
  });

  it('同值時依 id 穩定排序', () => {
    const list = buildReservationList([makeEvent('b'), makeEvent('a')], NOW);
    expect(list.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('end <= now 或 url 為空白的不收錄', () => {
    const list = buildReservationList(
      [
        makeEvent('ended', { end: '2026-11-20T04:00:00Z' }),
        makeEvent('blank-url', { url: '   ' }),
        makeEvent('ok'),
      ],
      NOW
    );
    expect(list.map((e) => e.id)).toEqual(['ok']);
  });

  it('壞資料（非法 end）略過，其餘照常', () => {
    const bad = makeEvent('bad');
    bad.datetime.end = { _seconds: NaN, _nanoseconds: 0 };
    expect(buildReservationList([bad, makeEvent('ok')], NOW).map((e) => e.id)).toEqual(['ok']);
  });

  it.each([
    ['請私訊IG', false],
    ['www.foo.com', false],
    ['javascript:alert(1)', false],
    [' https://x ', true],
  ])('TC-027 url %j 收錄=%s', (url, included) => {
    const list = buildReservationList([makeEvent('u', { url })], NOW);
    expect(list.length).toBe(included ? 1 : 0);
  });

  it('最多 20 筆', () => {
    const many = Array.from({ length: 25 }, (_, i) => makeEvent(`e${String(i).padStart(2, '0')}`));
    expect(buildReservationList(many, NOW)).toHaveLength(20);
  });
});
