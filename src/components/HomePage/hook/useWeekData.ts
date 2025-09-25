import { formatDateForAPI, getWeekEnd, getWeekStart } from '@/utils/weekHelpers';
import useWeekNavigation from './useWeekNavigation';

const useWeekData = () => {
  const { currentWeekStart } = useWeekNavigation();

  // 計算當週的開始和結束日期
  const weekStart = getWeekStart(currentWeekStart);
  const weekEnd = getWeekEnd(weekStart);
  const startDate = formatDateForAPI(weekStart);
  const endDate = formatDateForAPI(weekEnd);

  // 對於 events，使用今天作為開始時間，避免顯示已結束的活動
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventStartDate =
    currentWeekStart.getTime() === getWeekStart(new Date()).getTime()
      ? today.toISOString() // 如果是本週，從今天開始
      : weekStart.toISOString(); // 如果是其他週，從該週開始
  const endDateISO = new Date(weekEnd.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();

  return {
    startDate,
    endDate,
    eventStartDate,
    endDateISO,
  };
};

export default useWeekData;
