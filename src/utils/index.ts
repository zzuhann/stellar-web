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

  // 將今天的時間設為午夜 00:00:00
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // 設定為今年的生日（午夜 00:00:00）
  const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

  // 計算天數差異
  const diffTime = thisYearBirthday.getTime() - todayMidnight.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // 如果今年的生日已過，計算到明年生日的天數
    const nextYearBirthday = new Date(
      today.getFullYear() + 1,
      birthday.getMonth(),
      birthday.getDate()
    );
    return Math.ceil(
      (nextYearBirthday.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24)
    );
  } else {
    // 今年的生日還沒到或就是今天（diffDays = 0）
    return diffDays;
  }
};

// 日期範圍格式化 (YYYY/MM/DD - YYYY/MM/DD)
export const formatDateRange = (startDate: Date | string, endDate: Date | string): string => {
  const formatSingleDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const startDateStr = formatSingleDate(startDate);
  const endDateStr = formatSingleDate(endDate);
  return startDateStr === endDateStr ? startDateStr : `${startDateStr} - ${endDateStr}`;
};
