import { FirebaseTimestamp } from '@/types';

// Firebase Timestamp 轉換工具
export const firebaseTimestampToDate = (timestamp: {
  _seconds: number;
  _nanoseconds: number;
}): Date => {
  return new Date(timestamp._seconds * 1000);
};

// 判斷 timestamp 是否早於「現在」（含日期+時間，不是只比日期）
// now 參數預設 new Date()，可在測試中傳入固定時間點
export const isPastTimestamp = (timestamp: FirebaseTimestamp, now: Date = new Date()): boolean => {
  return firebaseTimestampToDate(timestamp).getTime() < now.getTime();
};

// 將 Date 轉換為 Asia/Taipei 時區的 YYYY-MM-DD 格式。
// 注意：這裡的「Taipei」明確指 Asia/Taipei 時區，不是使用者瀏覽器所在地——
// 台灣沒有日光節約時間，固定 UTC+8，不用 .getFullYear()/.getDate() 這類會
// 受瀏覽器本地時區影響的方法，改用 Intl.DateTimeFormat 明確指定 timeZone。
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

// 將 Date 轉換為 Asia/Taipei 時區的 HH:mm 格式（見上方 dateToTaipeiDateString 註解）
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

// 將「YYYY-MM-DD」日期字串 + 時間字串，依 Asia/Taipei 時區（固定 UTC+8）組成 FirebaseTimestamp。
// 明確帶 +08:00 offset，不依賴瀏覽器 local timezone 解讀日期字串
// （例如投稿表單的 startDate/endDate/reservationDate+reservationTime 送出時都經過這裡）。
export const taipeiDateTimeToTimestamp = (
  dateStr: string,
  time: string
): { _seconds: number; _nanoseconds: number } => {
  return {
    _seconds: Math.floor(new Date(`${dateStr}T${time}+08:00`).getTime() / 1000),
    _nanoseconds: 0,
  };
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

// 簡短日期範圍，格式為「M/DD」或「M/DD - M/DD」，使用本地時區
export const formatEventDateShort = (start: FirebaseTimestamp, end: FirebaseTimestamp): string => {
  const s = firebaseTimestampToDate(start);
  const e = firebaseTimestampToDate(end);
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return s.toDateString() === e.toDateString() ? fmt(s) : `${fmt(s)} - ${fmt(e)}`;
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

  // All Day Event 格式：YYYYMMDD（結束日期要加一天，因為 Google Calendar 的結束日期是 exclusive）
  const formatToAllDayDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // 結束日期加一天（Google Calendar all day event 結束日期是 exclusive）
  const endPlusOne = new Date(end);
  endPlusOne.setDate(endPlusOne.getDate() + 1);

  const dates = `${formatToAllDayDate(start)}/${formatToAllDayDate(endPlusOne)}`;
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
