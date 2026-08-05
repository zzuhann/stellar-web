import { FirebaseTimestamp } from '@/types';

// Firebase Timestamp 轉換工具
export const firebaseTimestampToDate = (timestamp: {
  _seconds: number;
  _nanoseconds: number;
}): Date => {
  return new Date(timestamp._seconds * 1000);
};

// 將 Date 轉換為本地時區的 YYYY-MM-DD 格式（避免時區問題）
export const dateToLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 將 Date 轉換為本地時區的 HH:mm 格式
export const dateToLocalTimeString = (date: Date): string => {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
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
  eventId,
}: {
  title: string;
  startDate: FirebaseTimestamp;
  endDate: FirebaseTimestamp;
  location: string;
  eventId: string;
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
  const eventUrl = `https://www.stellar-zone.com/event/${eventId}`;
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
  eventId,
}: {
  title: string;
  startAt: FirebaseTimestamp;
  location?: string;
  eventId: string;
}): string => {
  const start = firebaseTimestampToDate(startAt);
  const end = new Date(start.getTime() + 5 * 60 * 1000);

  // Google Calendar 指定時間格式：YYYYMMDDTHHmmssZ（UTC）
  const formatToDateTime = (date: Date): string =>
    date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const dates = `${formatToDateTime(start)}/${formatToDateTime(end)}`;
  const eventUrl = `https://www.stellar-zone.com/event/${eventId}`;
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
