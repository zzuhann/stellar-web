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
