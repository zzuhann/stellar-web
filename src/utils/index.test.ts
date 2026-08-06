import { describe, it, expect } from 'vitest';
import {
  formatEventDate,
  formatDateRange,
  formatEventDateShort,
  firebaseTimestampToDate,
  dateToTaipeiDateString,
  dateToTaipeiTimeString,
  taipeiDateTimeToTimestamp,
  generateGoogleCalendarUrl,
  generateGoogleCalendarUrlAtTime,
  formatReservationDateTime,
  isPastTimestamp,
  isHttpUrl,
  isValidCalendarDateString,
} from './index';

describe('formatEventDate', () => {
  it('跨日活動：2026/1/27 - 2026/2/1', () => {
    const startDate = { _seconds: 1769443200, _nanoseconds: 0 };
    const endDate = { _seconds: 1769961599, _nanoseconds: 0 };
    const result = formatEventDate(startDate, endDate);
    expect(result).toBe('2026/1/27 - 2026/2/1');
  });

  it('單日活動：同一天只顯示一次', () => {
    // 2026/1/27 00:00:00 到 2026/1/27 23:59:59
    const startDate = { _seconds: 1769443200, _nanoseconds: 0 };
    const endDate = { _seconds: 1769529599, _nanoseconds: 0 };
    const result = formatEventDate(startDate, endDate);
    expect(result).toBe('2026/1/27');
  });

  it('跨月活動：2025/12/31 - 2026/1/2', () => {
    // 2025/12/31 到 2026/1/2
    const startDate = { _seconds: 1767110400, _nanoseconds: 0 }; // 2025/12/31
    const endDate = { _seconds: 1767369599, _nanoseconds: 0 }; // 2026/1/2
    const result = formatEventDate(startDate, endDate);
    expect(result).toBe('2025/12/31 - 2026/1/2');
  });

  it('跨年活動：2025/12/24 - 2026/1/5', () => {
    const startDate = { _seconds: 1766505600, _nanoseconds: 0 }; // 2025/12/24
    const endDate = { _seconds: 1767628799, _nanoseconds: 0 }; // 2026/1/5
    const result = formatEventDate(startDate, endDate);
    expect(result).toBe('2025/12/24 - 2026/1/5');
  });
});

describe('formatDateRange', () => {
  it('跨日活動（ISO string）：2026/1/27 - 2026/2/1', () => {
    const start = '2026-01-26T16:00:00.000Z';
    const end = '2026-02-01T15:59:59.000Z';
    const result = formatDateRange(start, end);
    expect(result).toBe('2026/1/27 - 2026/2/1');
  });

  it('單日活動（ISO string）：同一天只顯示一次', () => {
    const start = '2026-01-26T16:00:00.000Z'; // 台灣 2026/1/27
    const end = '2026-01-27T15:59:59.000Z'; // 台灣 2026/1/27
    const result = formatDateRange(start, end);
    expect(result).toBe('2026/1/27');
  });

  it('跨日活動（Date 物件）：2026/3/15 - 2026/3/20', () => {
    const start = new Date(2026, 2, 15); // 月份從 0 開始，2 = 3月
    const end = new Date(2026, 2, 20);
    const result = formatDateRange(start, end);
    expect(result).toBe('2026/3/15 - 2026/3/20');
  });

  it('單日活動（Date 物件）：同一天只顯示一次', () => {
    const start = new Date(2026, 4, 10); // 2026/5/10
    const end = new Date(2026, 4, 10);
    const result = formatDateRange(start, end);
    expect(result).toBe('2026/5/10');
  });

  it('跨月活動：2026/6/30 - 2026/7/5', () => {
    const start = new Date(2026, 5, 30);
    const end = new Date(2026, 6, 5);
    const result = formatDateRange(start, end);
    expect(result).toBe('2026/6/30 - 2026/7/5');
  });

  it('跨年活動：2026/12/28 - 2027/1/3', () => {
    const start = new Date(2026, 11, 28);
    const end = new Date(2027, 0, 3);
    const result = formatDateRange(start, end);
    expect(result).toBe('2026/12/28 - 2027/1/3');
  });
});

describe('formatEventDateShort', () => {
  // noon UTC 確保在任何時區都落在同一個本地日期
  const ts = (year: number, month: number, day: number) => ({
    _seconds: Math.floor(Date.UTC(year, month - 1, day, 12, 0, 0) / 1000),
    _nanoseconds: 0,
  });

  it('單日活動只顯示一次，格式 M/D', () => {
    const result = formatEventDateShort(ts(2026, 5, 3), ts(2026, 5, 3));
    expect(result).toBe('5/3');
  });

  it('跨日活動顯示範圍', () => {
    const result = formatEventDateShort(ts(2026, 5, 3), ts(2026, 5, 10));
    expect(result).toBe('5/3 - 5/10');
  });

  it('跨月活動', () => {
    const result = formatEventDateShort(ts(2026, 5, 30), ts(2026, 6, 5));
    expect(result).toBe('5/30 - 6/5');
  });

  it('個位數日期不補零：1月1日', () => {
    const result = formatEventDateShort(ts(2026, 1, 1), ts(2026, 1, 1));
    expect(result).toBe('1/1');
  });

  it('依 Asia/Taipei 而非測試環境本地時區換算日期（跨日邊界）', () => {
    // UTC 2026-01-04 20:00 = Taipei 2026-01-05 04:00，若誤用本地時區元件可能仍停留在 1/4
    const startAt = { _seconds: Date.UTC(2026, 0, 4, 20, 0, 0) / 1000, _nanoseconds: 0 };
    const result = formatEventDateShort(startAt, startAt);
    expect(result).toBe('1/5');
  });

  it('月日相同但年份不同時，不會被誤判為單日活動', () => {
    const result = formatEventDateShort(ts(2026, 1, 5), ts(2027, 1, 5));
    expect(result).toBe('1/5 - 1/5');
  });
});

describe('firebaseTimestampToDate', () => {
  it('正確轉換 Firebase timestamp 為 Date', () => {
    const timestamp = { _seconds: 1769443200, _nanoseconds: 0 };
    const result = firebaseTimestampToDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(1769443200000);
  });

  it('處理含 nanoseconds 的 timestamp', () => {
    const timestamp = { _seconds: 1769443200, _nanoseconds: 500000000 };
    const result = firebaseTimestampToDate(timestamp);
    // 目前實作只使用 seconds，nanoseconds 被忽略
    expect(result.getTime()).toBe(1769443200000);
  });
});

describe('isPastTimestamp', () => {
  const now = new Date(2026, 7, 6, 12, 0, 0); // 2026/8/6 12:00

  it('timestamp 早於 now 時回傳 true', () => {
    const timestamp = {
      _seconds: Math.floor(new Date(2026, 7, 5, 0, 0, 0).getTime() / 1000),
      _nanoseconds: 0,
    };
    expect(isPastTimestamp(timestamp, now)).toBe(true);
  });

  it('timestamp 晚於 now 時回傳 false', () => {
    const timestamp = {
      _seconds: Math.floor(new Date(2026, 7, 7, 0, 0, 0).getTime() / 1000),
      _nanoseconds: 0,
    };
    expect(isPastTimestamp(timestamp, now)).toBe(false);
  });

  it('同一天但時間早於 now 時仍視為過去（比較到分鐘，不是只比日期）', () => {
    const timestamp = {
      _seconds: Math.floor(new Date(2026, 7, 6, 8, 0, 0).getTime() / 1000),
      _nanoseconds: 0,
    };
    expect(isPastTimestamp(timestamp, now)).toBe(true);
  });

  it('同一天但時間晚於 now 時視為尚未過去', () => {
    const timestamp = {
      _seconds: Math.floor(new Date(2026, 7, 6, 18, 0, 0).getTime() / 1000),
      _nanoseconds: 0,
    };
    expect(isPastTimestamp(timestamp, now)).toBe(false);
  });

  it('未傳入 now 時預設用目前時間比較', () => {
    const farFuture = {
      _seconds: Math.floor(new Date(2099, 0, 1).getTime() / 1000),
      _nanoseconds: 0,
    };
    const farPast = {
      _seconds: Math.floor(new Date(2000, 0, 1).getTime() / 1000),
      _nanoseconds: 0,
    };
    expect(isPastTimestamp(farFuture)).toBe(false);
    expect(isPastTimestamp(farPast)).toBe(true);
  });
});

describe('generateGoogleCalendarUrl', () => {
  const ts = (year: number, month: number, day: number, hour = 12) => ({
    _seconds: Date.UTC(year, month - 1, day, hour, 0, 0) / 1000,
    _nanoseconds: 0,
  });

  const baseArgs = {
    title: '測試活動',
    location: '測試地點',
    eventSlugOrId: 'event-1',
  };

  it('單日活動：結束日期正確加一天（exclusive）', () => {
    const url = generateGoogleCalendarUrl({
      ...baseArgs,
      startDate: ts(2026, 8, 5),
      endDate: ts(2026, 8, 5),
    });
    const params = new URL(url).searchParams;
    expect(params.get('dates')).toBe('20260805/20260806');
  });

  it('跨日活動：結束日期加一天', () => {
    const url = generateGoogleCalendarUrl({
      ...baseArgs,
      startDate: ts(2026, 8, 5),
      endDate: ts(2026, 8, 10),
    });
    const params = new URL(url).searchParams;
    expect(params.get('dates')).toBe('20260805/20260811');
  });

  it('結束日期是月底時，加一天要正確跨月（不用 .setDate() 這類會受瀏覽器時區影響的方法）', () => {
    const url = generateGoogleCalendarUrl({
      ...baseArgs,
      startDate: ts(2026, 1, 30),
      endDate: ts(2026, 1, 31),
    });
    const params = new URL(url).searchParams;
    expect(params.get('dates')).toBe('20260130/20260201');
  });

  it('結束日期是年底時，加一天要正確跨年', () => {
    const url = generateGoogleCalendarUrl({
      ...baseArgs,
      startDate: ts(2026, 12, 31),
      endDate: ts(2026, 12, 31),
    });
    const params = new URL(url).searchParams;
    expect(params.get('dates')).toBe('20261231/20270101');
  });

  it('依 Asia/Taipei 而非測試環境本地時區換算日期（跨日邊界）', () => {
    // UTC 2026-01-04 20:00 = Taipei 2026-01-05 04:00，若誤用本地時區元件可能仍停留在 1/4
    const startAt = { _seconds: Date.UTC(2026, 0, 4, 20, 0, 0) / 1000, _nanoseconds: 0 };
    const url = generateGoogleCalendarUrl({
      ...baseArgs,
      startDate: startAt,
      endDate: startAt,
    });
    const params = new URL(url).searchParams;
    expect(params.get('dates')).toBe('20260105/20260106');
  });
});

describe('generateGoogleCalendarUrlAtTime', () => {
  const startAt = { _seconds: Date.UTC(2026, 7, 20, 12, 0, 0) / 1000, _nanoseconds: 0 }; // 2026/8/20 20:00 台灣時間

  it('產生的 dates 區間固定為 5 分鐘', () => {
    const url = generateGoogleCalendarUrlAtTime({
      title: '[預約提醒] - 測試活動',
      startAt,
      eventSlugOrId: 'event-1',
    });
    const params = new URL(url).searchParams;
    const [start, end] = (params.get('dates') ?? '').split('/');
    expect(start).toBe('20260820T120000Z');
    expect(end).toBe('20260820T120500Z');
  });

  it('標題與活動網址正確帶入', () => {
    const url = generateGoogleCalendarUrlAtTime({
      title: '[預約提醒] - 測試活動',
      startAt,
      eventSlugOrId: 'event-1',
    });
    const params = new URL(url).searchParams;
    expect(params.get('text')).toBe('[預約提醒] - 測試活動');
    expect(params.get('details')).toContain('https://www.stellar-zone.com/event/event-1');
  });

  it('eventSlugOrId 傳 slug 時活動網址使用 slug（呼叫端應傳 event.slug ?? event.id）', () => {
    const url = generateGoogleCalendarUrlAtTime({
      title: '[預約提醒] - 測試活動',
      startAt,
      eventSlugOrId: 'my-event-slug',
    });
    const params = new URL(url).searchParams;
    expect(params.get('details')).toContain('https://www.stellar-zone.com/event/my-event-slug');
  });

  it('未提供 location 時預設為空字串', () => {
    const url = generateGoogleCalendarUrlAtTime({
      title: '[預約提醒] - 測試活動',
      startAt,
      eventSlugOrId: 'event-1',
    });
    const params = new URL(url).searchParams;
    expect(params.get('location')).toBe('');
  });
});

describe('formatReservationDateTime', () => {
  it('格式化為含星期的日期時間，例如 2026/8/20（四）20:00', () => {
    const startAt = { _seconds: Date.UTC(2026, 7, 20, 12, 3, 0) / 1000, _nanoseconds: 0 };
    expect(formatReservationDateTime(startAt)).toBe('2026/8/20（四）20:03');
  });

  it('分鐘數補零', () => {
    const startAt = { _seconds: Date.UTC(2026, 0, 1, 0, 5, 0) / 1000, _nanoseconds: 0 }; // 台灣 1/1 08:05
    expect(formatReservationDateTime(startAt)).toBe('2026/1/1（四）08:05');
  });
});

// 以下三個 describe 都用 Date.UTC 建構輸入（不受測試環境本地時區影響），
// 刻意挑選 UTC 時刻換算成 Asia/Taipei 後會「跨到不同日期/跟 UTC 時刻數字不同」
// 的案例——如果實作退化成用 .getFullYear()/.getHours() 等本地時區方法，
// 在非 Asia/Taipei 的測試環境（例如 CI 常見的 UTC）這些案例就會斷言失敗，
// 藉此驗證修正是否真的生效，而不是「剛好在開發機的時區下測試也會過」
describe('dateToTaipeiDateString', () => {
  it('正確轉換為 YYYY-MM-DD 格式（有補0）', () => {
    // UTC 2026-01-04 20:00 = Taipei 2026-01-05 04:00（跨日）
    const date = new Date(Date.UTC(2026, 0, 4, 20, 0, 0));
    expect(dateToTaipeiDateString(date)).toBe('2026-01-05');
  });

  it('處理雙位數月份和日期', () => {
    // UTC 2026-11-14 20:00 = Taipei 2026-11-15 04:00（跨日）
    const date = new Date(Date.UTC(2026, 10, 14, 20, 0, 0));
    expect(dateToTaipeiDateString(date)).toBe('2026-11-15');
  });
});

describe('dateToTaipeiTimeString', () => {
  it('正確轉換為 HH:mm 格式並補零', () => {
    // UTC 2026-08-05 16:30 = Taipei 2026-08-06 00:30（跨日，時間也補零）
    const date = new Date(Date.UTC(2026, 7, 5, 16, 30, 0));
    expect(dateToTaipeiTimeString(date)).toBe('00:30');
  });

  it('處理雙位數小時與分鐘', () => {
    // UTC 2026-08-05 05:05 = Taipei 2026-08-05 13:05
    const date = new Date(Date.UTC(2026, 7, 5, 5, 5, 0));
    expect(dateToTaipeiTimeString(date)).toBe('13:05');
  });

  it('Taipei 午夜 00:00 邊界', () => {
    // UTC 2026-08-05 16:00 = Taipei 2026-08-06 00:00 整
    const date = new Date(Date.UTC(2026, 7, 5, 16, 0, 0));
    expect(dateToTaipeiTimeString(date)).toBe('00:00');
  });

  it('Taipei 23:59 邊界', () => {
    // UTC 2026-08-05 15:59 = Taipei 2026-08-05 23:59
    const date = new Date(Date.UTC(2026, 7, 5, 15, 59, 0));
    expect(dateToTaipeiTimeString(date)).toBe('23:59');
  });
});

describe('taipeiDateTimeToTimestamp', () => {
  it('依 Asia/Taipei（UTC+8）解讀日期字串，而非瀏覽器本地時區', () => {
    const result = taipeiDateTimeToTimestamp('2026-08-05', '00:00:00');
    // 2026-08-05T00:00:00+08:00 = 2026-08-04T16:00:00Z
    expect(result._seconds).toBe(Date.UTC(2026, 7, 4, 16, 0, 0) / 1000);
  });

  it('23:59:59 正確落在同一個台北日期', () => {
    const result = taipeiDateTimeToTimestamp('2026-08-05', '23:59:59');
    // 2026-08-05T23:59:59+08:00 = 2026-08-05T15:59:59Z
    expect(result._seconds).toBe(Date.UTC(2026, 7, 5, 15, 59, 59) / 1000);
  });

  it('月底 23:59:59（跨月）', () => {
    const result = taipeiDateTimeToTimestamp('2026-01-31', '23:59:59');
    // 2026-01-31T23:59:59+08:00 = 2026-01-31T15:59:59Z（UTC 端仍是 1/31，時區換算不涉及日期進位）
    expect(result._seconds).toBe(Date.UTC(2026, 0, 31, 15, 59, 59) / 1000);
    // 轉回 Taipei 日期字串應仍是投稿當天的月底，不會被算成 2 月
    expect(dateToTaipeiDateString(firebaseTimestampToDate(result))).toBe('2026-01-31');
  });

  it('年底 23:59:59（跨年）', () => {
    const result = taipeiDateTimeToTimestamp('2026-12-31', '23:59:59');
    expect(result._seconds).toBe(Date.UTC(2026, 11, 31, 15, 59, 59) / 1000);
    expect(dateToTaipeiDateString(firebaseTimestampToDate(result))).toBe('2026-12-31');
  });

  it('年初 00:00:00（跨年，UTC 端仍落在前一年）', () => {
    const result = taipeiDateTimeToTimestamp('2027-01-01', '00:00:00');
    // 2027-01-01T00:00:00+08:00 = 2026-12-31T16:00:00Z
    expect(result._seconds).toBe(Date.UTC(2026, 11, 31, 16, 0, 0) / 1000);
    expect(dateToTaipeiDateString(firebaseTimestampToDate(result))).toBe('2027-01-01');
  });

  it('與 dateToTaipeiDateString/dateToTaipeiTimeString 互為 round-trip', () => {
    const timestamp = taipeiDateTimeToTimestamp('2026-08-20', '20:05:00');
    const date = firebaseTimestampToDate(timestamp);
    expect(dateToTaipeiDateString(date)).toBe('2026-08-20');
    expect(dateToTaipeiTimeString(date)).toBe('20:05');
  });
});

describe('isHttpUrl', () => {
  it('合法的 https 網址回傳 true', () => {
    expect(isHttpUrl('https://forms.gle/xxxx')).toBe(true);
  });

  it('合法的 http 網址回傳 true', () => {
    expect(isHttpUrl('http://example.com')).toBe(true);
  });

  it('只有 protocol 沒有 host 的殘缺網址回傳 false', () => {
    expect(isHttpUrl('https://')).toBe(false);
  });

  it('非 http(s) protocol（例如 javascript:）回傳 false', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
  });

  it('非網址字串回傳 false', () => {
    expect(isHttpUrl('not-a-url')).toBe(false);
  });

  it('空字串回傳 false', () => {
    expect(isHttpUrl('')).toBe(false);
  });
});

describe('isValidCalendarDateString', () => {
  it('合法日期回傳 true', () => {
    expect(isValidCalendarDateString('2026-08-05')).toBe(true);
  });

  it('閏年 2/29 回傳 true', () => {
    expect(isValidCalendarDateString('2028-02-29')).toBe(true); // 2028 是閏年
  });

  it('非閏年 2/29 會被 Date 自動正規化成 3/1，需擋下', () => {
    expect(isValidCalendarDateString('2026-02-29')).toBe(false); // 2026 不是閏年
  });

  it('日期超出月份範圍（4 月 31 日）需擋下', () => {
    expect(isValidCalendarDateString('2026-04-31')).toBe(false);
  });

  it('月份超出範圍（13 月）需擋下', () => {
    expect(isValidCalendarDateString('2026-13-01')).toBe(false);
  });

  it('格式不符（非 YYYY-MM-DD）回傳 false', () => {
    expect(isValidCalendarDateString('2026/08/05')).toBe(false);
    expect(isValidCalendarDateString('2026-8-5')).toBe(false);
    expect(isValidCalendarDateString('not-a-date')).toBe(false);
    expect(isValidCalendarDateString('')).toBe(false);
  });
});
