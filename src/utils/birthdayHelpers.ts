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
