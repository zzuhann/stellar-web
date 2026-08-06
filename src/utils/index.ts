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

// 判斷字串是否為結構完整的 http(s) 網址。用途是「顯示端」決定要不要把值渲染成可
// 點擊連結的防線（例如舊資料、直接呼叫 API 產生的髒資料），不是取代表單送出時
// 的驗證——表單驗證的職責在 lib/validations.ts，兩邊都呼叫這個函式維持同一套標準。
export const isHttpUrl = (url: string): boolean => {
  if (!/^https?:\/\//.test(url)) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 嚴格驗證「YYYY-MM-DD」字串是否為真的存在的日曆日期，而不只是格式正確或能被
// Date.parse/new Date 接受——例如 2026-02-30 用 new Date() 會被靜默正規化成
// 2026-03-02，Date.parse/isNaN 檢查不出來。做法是把字串拆成年月日後用
// new Date(year, month-1, day) 建構，再回頭比對三個欄位是否跟輸入一致（正規化
// 發生時，讀回來的值會跟輸入不同）。跟時區無關：建構與讀取都用同一組本地時間
// accessor，只是拿來偵測「日期是否被自動進位」，不是要判斷是哪個時區的哪一天。
export const isValidCalendarDateString = (dateStr: string): boolean => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
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

// 把「YYYY-MM-DD」日期字串解析為 Asia/Taipei 時區下的 {year, month, day}
// （month 從 0 開始，對齊 JS Date.getMonth() 慣例，方便呼叫端直接比較日曆日）。
// 不直接用 new Date(dateStr) 讀取年月日——date-only 字串會被當成 UTC 午夜解析，
// 非 UTC+8 環境下用 .getFullYear() 等本地方法讀回來可能整個位移一天。做法是
// 複用 taipeiDateTimeToTimestamp 先轉成明確的 UTC 瞬間，再用跟 dateToTaipeiDateString
// 一樣的 Intl.DateTimeFormat + timeZone: 'Asia/Taipei' 讀回日曆日。
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

// 把「YYYY-MM-DD」日期字串轉成本地 Date 物件，年月日已依 parseTaipeiDateString 正確
// 解析出 Taipei 日曆日。給只做「本地日期元件運算」（例如日曆格子生成、月份導覽狀態）
// 且不需要真實時間瞬間的呼叫端使用——這個 Date 代表的是「一個日曆日」，不是「一個
// UTC 瞬間」。回傳後請只用本地 getter（.getFullYear()/.getMonth()/.getDate()）操作，
// 不要再對它套用 Intl timeZone 轉換：那是給「已知代表某個真實瞬間」的 Date 用的，
// 對這種本地建構的 Date 再轉一次時區反而會依瀏覽器時區位移，產生新的 bug。
export const taipeiDateStringToLocalDate = (dateStr: string): Date => {
  const { year, month, day } = parseTaipeiDateString(dateStr);
  return new Date(year, month, day);
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

  // 取出 Date 在 Asia/Taipei 時區下的年/月/日，不用 .getFullYear()/.getMonth()/.getDate()
  // 這類會受瀏覽器 local timezone 影響的方法
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

  // 結束日期加一天（Google Calendar all day event 結束日期是 exclusive）。
  // 用 Date.UTC 組出「代表這個 Taipei 日曆日」的 UTC 午夜時間點做加一天運算
  // （Date.UTC 會自動處理月底/年底進位），再用 UTC getter 讀回——UTC getter
  // 不受瀏覽器 local timezone 影響，避免又混入瀏覽器時區。
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
