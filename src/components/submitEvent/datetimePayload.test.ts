import { describe, it, expect } from 'vitest';
import { buildDatetimePayload } from './datetimePayload';
import { taipeiDateTimeToTimestamp } from '@/utils';

describe('buildDatetimePayload', () => {
  it('一般活動：開始日 00:00:00 到結束日 23:59:59', () => {
    expect(
      buildDatetimePayload({ startDate: '2026-11-15', endDate: '2026-11-17', untilGone: false })
    ).toEqual({
      start: taipeiDateTimeToTimestamp('2026-11-15', '00:00:00'),
      end: taipeiDateTimeToTimestamp('2026-11-17', '23:59:59'),
    });
  });

  it('領完為止：忽略結束日，下架時間為開始日 + 7 天 23:59:59', () => {
    expect(
      buildDatetimePayload({ startDate: '2026-11-15', endDate: '2026-11-15', untilGone: true })
    ).toEqual({
      start: taipeiDateTimeToTimestamp('2026-11-15', '00:00:00'),
      end: taipeiDateTimeToTimestamp('2026-11-22', '23:59:59'),
    });
  });

  it('領完為止跨月', () => {
    expect(
      buildDatetimePayload({ startDate: '2026-11-28', endDate: '2026-11-28', untilGone: true }).end
    ).toEqual(taipeiDateTimeToTimestamp('2026-12-05', '23:59:59'));
  });
});
