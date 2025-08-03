// 日期格式化
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

// 相對時間格式化
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffInMs = target.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return '今天';
  if (diffInDays === 1) return '明天';
  if (diffInDays === -1) return '昨天';
  if (diffInDays > 0) return `${diffInDays} 天後`;
  return `${Math.abs(diffInDays)} 天前`;
}

// Firebase Timestamp 轉換工具
export const firebaseTimestampToDate = (timestamp: {
  _seconds: number;
  _nanoseconds: number;
}): Date => {
  return new Date(timestamp._seconds * 1000);
};
export const getDaysUntilBirthday = (birthdayStr: string): number => {
  if (!birthdayStr) return -1;

  const today = new Date();
  const birthday = new Date(birthdayStr);

  // 設定為今年的生日
  const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

  if (thisYearBirthday < today) {
    // 如果今年的生日已過，計算到明年生日的天數
    const nextYearBirthday = new Date(
      today.getFullYear() + 1,
      birthday.getMonth(),
      birthday.getDate()
    );
    return Math.ceil((nextYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    // 今年的生日還沒到
    return Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
};
