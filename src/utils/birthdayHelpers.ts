/**
 * 判斷是否要顯示生日帽子（顯示時間：前一天23:00 - 當天22:59）
 * 配合韓國時間邏輯
 */
export const shouldShowBirthdayHat = (birthday: string): boolean => {
  if (!birthday) return false;

  const now = new Date();
  const birthdayDate = new Date(birthday);

  // 設定今年的生日日期（午夜00:00:00）
  const thisYearBirthday = new Date(
    now.getFullYear(),
    birthdayDate.getMonth(),
    birthdayDate.getDate()
  );

  // 計算今天的開始時間
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 情況1：如果今天是生日當天，且時間在 00:00-22:59，顯示帽子
  if (todayStart.getTime() === thisYearBirthday.getTime()) {
    return now.getHours() <= 22;
  }

  // 情況2：如果明天是生日，且現在時間是 23:00，提前顯示帽子
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowBirthday = new Date(
    now.getFullYear(),
    birthdayDate.getMonth(),
    birthdayDate.getDate()
  );

  if (tomorrowStart.getTime() === tomorrowBirthday.getTime()) {
    return now.getHours() === 23;
  }

  return false;
};
