import { describe, it, expect } from 'vitest';
import { buildReservationPayload } from './reservationPayload';
import type { EventSubmissionFormData } from '@/lib/validations';

const baseData: EventSubmissionFormData = {
  title: '測試活動',
  artistIds: ['artist-1'],
  description: '',
  startDate: '2026-08-05',
  endDate: '2026-08-05',
  addressName: '台北市信義區',
  instagram: 'test_account',
  threads: '',
  mainImage: 'https://r2.example.com/image.jpg',
  detailImage: [],
  reservationUrl: '',
  reservationDate: '',
  reservationTime: '',
};

describe('buildReservationPayload', () => {
  it('三個欄位皆未填時，回傳 url/startAt 皆為 undefined 的完整物件（不整個省略）', () => {
    const result = buildReservationPayload(baseData);
    expect(result).toEqual({ url: undefined, startAt: undefined });
  });

  it('只填網址時，url 有值、startAt 為 undefined', () => {
    const result = buildReservationPayload({
      ...baseData,
      reservationUrl: 'https://forms.gle/xxxx',
    });
    expect(result.url).toBe('https://forms.gle/xxxx');
    expect(result.startAt).toBeUndefined();
  });

  it('網址前後有空白時會 trim', () => {
    const result = buildReservationPayload({
      ...baseData,
      reservationUrl: '  https://forms.gle/xxxx  ',
    });
    expect(result.url).toBe('https://forms.gle/xxxx');
  });

  it('日期與時間皆填寫時，startAt 依 Asia/Taipei 組成正確的 FirebaseTimestamp', () => {
    const result = buildReservationPayload({
      ...baseData,
      reservationUrl: 'https://forms.gle/xxxx',
      reservationDate: '2026-08-20',
      reservationTime: '20:00',
    });
    // 2026-08-20T20:00:00+08:00 = 2026-08-20T12:00:00Z
    expect(result.startAt).toEqual({
      _seconds: Date.UTC(2026, 7, 20, 12, 0, 0) / 1000,
      _nanoseconds: 0,
    });
  });

  it('只填日期沒填時間時，startAt 仍為 undefined（不會組出不完整的時間點）', () => {
    const result = buildReservationPayload({
      ...baseData,
      reservationDate: '2026-08-20',
    });
    expect(result.startAt).toBeUndefined();
  });

  it('只填時間沒填日期時，startAt 仍為 undefined', () => {
    const result = buildReservationPayload({
      ...baseData,
      reservationTime: '20:00',
    });
    expect(result.startAt).toBeUndefined();
  });
});
