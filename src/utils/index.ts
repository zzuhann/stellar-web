import { FirebaseTimestamp } from '@/types';

// Firebase Timestamp 轉換工具
export const firebaseTimestampToDate = (timestamp: {
  _seconds: number;
  _nanoseconds: number;
}): Date => {
  return new Date(timestamp._seconds * 1000);
};

// 判斷 timestamp 是否早於 now（含時間，不只比日期）；now 可在測試中覆寫成固定時間點
export const isPastTimestamp = (timestamp: FirebaseTimestamp, now: Date = new Date()): boolean => {
  return firebaseTimestampToDate(timestamp).getTime() < now.getTime();
};

// 判斷是否為結構完整的 http(s) 網址；顯示端（要不要渲染成連結）跟 lib/validations.ts
// 的表單驗證共用同一套標準
export const isHttpUrl = (url: string): boolean => {
  if (!/^https?:\/\//.test(url)) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 嚴格驗證日曆日期是否真的存在：new Date(2026, 1, 30) 這種無效日期會被靜默正規化成
// 3/2，Date.parse/isNaN 驗不出來，所以改成重建日期後比對三個欄位是否跟輸入一致
export const isValidCalendarDateString = (dateStr: string): boolean => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

// 轉成 Asia/Taipei（非瀏覽器所在時區）的 YYYY-MM-DD；台灣無日光節約，固定 UTC+8
export const dateToTaipeiDateString = (date: Date): string => {
  const formatter = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
};

export const dateToTaipeiTimeString = (date: Date): string => {
  const formatter = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('hour')}:${get('minute')}`;
};

// 把日期字串+時間依 Asia/Taipei（明確 +08:00 offset）組成 FirebaseTimestamp，不依賴瀏覽器時區解讀
export const taipeiDateTimeToTimestamp = (
  dateStr: string,
  time: string
): { _seconds: number; _nanoseconds: number } => {
  return {
    _seconds: Math.floor(new Date(`${dateStr}T${time}+08:00`).getTime() / 1000),
    _nanoseconds: 0,
  };
};

// 解析為 Asia/Taipei 的 {year, month, day}（month 0-indexed）；不直接 new Date(dateStr)
// 讀取，date-only 字串會被當 UTC 午夜解析，非 UTC+8 環境下可能位移一天
export const parseTaipeiDateString = (
  dateStr: string
): { year: number; month: number; day: number } => {
  const timestamp = taipeiDateTimeToTimestamp(dateStr, '00:00:00');
  const date = firebaseTimestampToDate(timestamp);

  const formatter = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '0';
  return { year: Number(get('year')), month: Number(get('month')) - 1, day: Number(get('day')) };
};

// 把日期字串轉成代表該 Taipei 日曆日的本地 Date；回傳後只能用本地 getter 讀取，
// 不要再套用 Intl timeZone 轉換（會重複轉換、依瀏覽器時區位移）
export const taipeiDateStringToLocalDate = (dateStr: string): Date => {
  const { year, month, day } = parseTaipeiDateString(dateStr);
  return new Date(year, month, day);
};

// 取得 Asia/Taipei 的「今天」；取代裸的 new Date()，避免非 UTC+8 使用者跨午夜時
// 抓到瀏覽器自己的今天而非 Taipei 的今天
export const getTaipeiToday = (): Date => {
  return taipeiDateStringToLocalDate(dateToTaipeiDateString(new Date()));
};

// 日期範圍格式化 (YYYY/M/D - YYYY/M/D)
export const formatDateRange = (startDate: Date | string, endDate: Date | string): string => {
  const formatSingleDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const formatter = new Intl.DateTimeFormat('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    return formatter.format(dateObj);
  };

  const startDateStr = formatSingleDate(startDate);
  const endDateStr = formatSingleDate(endDate);
  return startDateStr === endDateStr ? startDateStr : `${startDateStr} - ${endDateStr}`;
};

export const formatEventDate = (startDate: FirebaseTimestamp, endDate: FirebaseTimestamp) => {
  const start = firebaseTimestampToDate(startDate);
  const end = firebaseTimestampToDate(endDate);

  const formatter = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const startStr = formatter.format(start);
  const endStr = formatter.format(end);

  // 如果同一天就只顯示一天
  return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
};

// 預約開始時間格式化，含星期，例如 2026/8/20（四）20:00
export const formatReservationDateTime = (startAt: FirebaseTimestamp): string => {
  const date = firebaseTimestampToDate(startAt);
  const formatter = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  const weekday = get('weekday').replace('週', '');

  return `${get('year')}/${get('month')}/${get('day')}（${weekday}）${get('hour')}:${get('minute')}`;
};

// 簡短日期範圍，格式為「M/D」或「M/D - M/D」，明確使用 Asia/Taipei 時區（不受瀏覽器時區影響）
export const formatEventDateShort = (start: FirebaseTimestamp, end: FirebaseTimestamp): string => {
  const s = firebaseTimestampToDate(start);
  const e = firebaseTimestampToDate(end);

  const formatter = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  const getParts = (date: Date) => {
    const parts = formatter.formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
    return { year: get('year'), month: get('month'), day: get('day') };
  };

  const sParts = getParts(s);
  const eParts = getParts(e);
  const fmt = (parts: { month: string; day: string }) => `${parts.month}/${parts.day}`;

  // 同一個 Taipei 日曆日才視為單日活動；只比 month/day 會讓跨年同月同日誤判為同一天，故連 year 一起比
  const isSameDay =
    sParts.year === eParts.year && sParts.month === eParts.month && sParts.day === eParts.day;

  return isSameDay ? fmt(sParts) : `${fmt(sParts)} - ${fmt(eParts)}`;
};

// 生成 Google Calendar 加入行事曆 URL（All Day Event）
export const generateGoogleCalendarUrl = ({
  title,
  startDate,
  endDate,
  location,
  eventSlugOrId,
}: {
  title: string;
  startDate: FirebaseTimestamp;
  endDate: FirebaseTimestamp;
  location: string;
  eventSlugOrId: string; // 呼叫端請傳 event.slug ?? event.id，比照全站活動連結慣例
}): string => {
  const start = firebaseTimestampToDate(startDate);
  const end = firebaseTimestampToDate(endDate);

  // 取出 Date 在 Asia/Taipei 下的年/月/日，不用 .getFullYear() 等受瀏覽器時區影響的方法
  const getTaipeiDateParts = (date: Date): { year: number; month: number; day: number } => {
    const formatter = new Intl.DateTimeFormat('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(date);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '0';
    return { year: Number(get('year')), month: Number(get('month')), day: Number(get('day')) };
  };

  // All Day Event 格式：YYYYMMDD
  const formatAllDayDate = (parts: { year: number; month: number; day: number }): string => {
    const month = String(parts.month).padStart(2, '0');
    const day = String(parts.day).padStart(2, '0');
    return `${parts.year}${month}${day}`;
  };

  const startParts = getTaipeiDateParts(start);
  const endParts = getTaipeiDateParts(end);

  // 結束日期加一天（Google Calendar all-day 結束日期是 exclusive）；用 Date.UTC 運算
  // 自動處理月底/年底進位，UTC getter 讀回避免混入瀏覽器時區
  const endPlusOneUtcMidnight = new Date(
    Date.UTC(endParts.year, endParts.month - 1, endParts.day + 1)
  );
  const endPlusOneParts = {
    year: endPlusOneUtcMidnight.getUTCFullYear(),
    month: endPlusOneUtcMidnight.getUTCMonth() + 1,
    day: endPlusOneUtcMidnight.getUTCDate(),
  };

  const dates = `${formatAllDayDate(startParts)}/${formatAllDayDate(endPlusOneParts)}`;
  const eventUrl = `https://www.stellar-zone.com/event/${eventSlugOrId}`;
  const details = `活動名稱：${title}\n活動網址：${eventUrl}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: dates,
    location: location,
    details: details,
    sprop: 'name:STELLAR 台灣生咖地圖',
  });

  // 手動加上第二個 sprop（URLSearchParams 不支援重複 key）
  return `https://calendar.google.com/calendar/render?${params.toString()}&sprop=website:https://www.stellar-zone.com/`;
};

// 生成 Google Calendar 加入行事曆 URL（指定時間點的事件，固定 5 分鐘時長）
export const generateGoogleCalendarUrlAtTime = ({
  title,
  startAt,
  location = '',
  eventSlugOrId,
}: {
  title: string;
  startAt: FirebaseTimestamp;
  location?: string;
  eventSlugOrId: string; // 呼叫端請傳 event.slug ?? event.id，比照全站活動連結慣例
}): string => {
  const start = firebaseTimestampToDate(startAt);
  const end = new Date(start.getTime() + 5 * 60 * 1000);

  // Google Calendar 指定時間格式：YYYYMMDDTHHmmssZ（UTC）
  const formatToDateTime = (date: Date): string =>
    date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const dates = `${formatToDateTime(start)}/${formatToDateTime(end)}`;
  const eventUrl = `https://www.stellar-zone.com/event/${eventSlugOrId}`;
  const details = `活動名稱：${title}\n活動網址：${eventUrl}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: dates,
    location: location,
    details: details,
    sprop: 'name:STELLAR 台灣生咖地圖',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}&sprop=website:https://www.stellar-zone.com/`;
};
