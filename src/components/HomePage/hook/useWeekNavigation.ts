import { useQueryState } from '@/hooks/useQueryState';
import { getWeekEnd, getWeekStart } from '@/utils/weekHelpers';

const useWeekNavigation = () => {
  const [currentWeekStart, setCurrentWeekStart] = useQueryState('week', {
    defaultValue: getWeekStart(new Date()),
    parse: (value) => {
      // 將 YYYY-MM-DD 字符串反序列化為 Date，並確保是週的開始日期
      if (!value) return getWeekStart(new Date());
      try {
        const date = new Date(value);
        return getWeekStart(date);
      } catch {
        return getWeekStart(new Date());
      }
    },
  });

  const goToPreviousWeek = (activeTab: 'birthday' | 'events') => {
    // 如果是生咖tab，不能往回看到本週之前
    if (activeTab === 'events') {
      const thisWeekStart = getWeekStart(new Date());
      if (currentWeekStart.getTime() <= thisWeekStart.getTime()) {
        return; // 已經是本週或之前，不允許往回
      }
    }

    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  // 判斷是否為當前週（用於顯示文字）
  const isCurrentWeek = (() => {
    const thisWeekStart = getWeekStart(new Date());
    return currentWeekStart.getTime() === thisWeekStart.getTime();
  })();

  const currentWeekEnd = (() => getWeekEnd(currentWeekStart))();

  return {
    currentWeekStart,
    goToPreviousWeek,
    goToNextWeek,
    isCurrentWeek,
    currentWeekEnd,
    setCurrentWeekStart,
  };
};

export default useWeekNavigation;
