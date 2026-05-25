/**
 * 判斷是否要顯示生日帽子
 * 以使用者當前時區的今天日期為準
 */
export const shouldShowBirthdayHat = (birthday: string): boolean => {
  if (!birthday) return false;

  const now = new Date();
  const [, birthdayMonth, birthdayDay] = birthday.split('-').map(Number);

  return now.getMonth() + 1 === birthdayMonth && now.getDate() === birthdayDay;
};

/**
 * 格式化生日為「X 月 X 日」格式
 * 直接解析字串，不受時區影響
 * @param birthday - 生日字串，格式為 YYYY-MM-DD
 */
export const formatBirthdayMonthDay = (birthday: string): string => {
  if (!birthday) return '';

  const [, month, day] = birthday.split('-').map(Number);
  if (isNaN(month) || isNaN(day)) return '';

  return `${month} 月 ${day} 日`;
};

/**
 * 格式化生日為「M/D」短格式，例如 4/17
 * 直接解析字串，不受時區影響
 * @param birthday - 生日字串，格式為 YYYY-MM-DD
 */
export const formatBirthdayShort = (birthday: string): string => {
  if (!birthday) return '';

  const [, month, day] = birthday.split('-').map(Number);
  if (isNaN(month) || isNaN(day)) return '';

  return `${month}/${day}`;
};

/**
 * 格式化生日為「YYYY/M/D」格式
 * 直接解析字串，不受時區影響
 * @param birthday - 生日字串，格式為 YYYY-MM-DD
 */
export const formatBirthdayFull = (birthday: string): string => {
  if (!birthday) return '';

  const [year, month, day] = birthday.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return '';

  return `${year}/${month}/${day}`;
};
