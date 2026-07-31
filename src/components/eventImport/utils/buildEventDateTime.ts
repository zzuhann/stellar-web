import { FirebaseTimestamp } from '@/types';

function toTimestamp(dateStr: string, timeStr: string): FirebaseTimestamp {
  return {
    _seconds: Math.floor(new Date(`${dateStr}T${timeStr}`).getTime() / 1000),
    _nanoseconds: 0,
  };
}

/**
 * 既有公開投稿表單固定用 00:00:00 / 23:59:59 當作一天的起訖（因為它沒有時段欄位）。
 * 這個匯入頁面多了「活動時段」欄位（design-backend.md：timeStart/timeEnd 對應
 * `CoffeeEvent.datetime` 的時間部分），管理員知道確切時段時就用實際時段，
 * 沒有時就沿用既有預設值。
 */
export function buildEventStart(startDate: string, timeStart: string): FirebaseTimestamp {
  return toTimestamp(startDate, timeStart ? `${timeStart}:00` : '00:00:00');
}

export function buildEventEnd(endDate: string, timeEnd: string): FirebaseTimestamp {
  return toTimestamp(endDate, timeEnd ? `${timeEnd}:00` : '23:59:59');
}
