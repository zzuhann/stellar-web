import { useBirthdayArtistsQuery } from '@/hooks/useHomePage';
import useWeekData from './useWeekData';
import useTabState from './useTabState';
import { useMemo } from 'react';

function birthdayMonthDay(birthday: string): number {
  const [, month, day] = birthday.split('-').map(Number);
  return month * 100 + day;
}

const useBirthdayArtists = () => {
  const { startDate, endDate } = useWeekData();
  const { activeTab } = useTabState();

  const { data: artists = [], isLoading } = useBirthdayArtistsQuery(startDate, endDate, {
    enabled: activeTab === 'birthday',
  });

  const weekBirthdayArtists = useMemo(() => {
    return [...artists].sort((a, b) => {
      const aCount = a.coffeeEventCount ?? 0;
      const bCount = b.coffeeEventCount ?? 0;
      if (bCount !== aCount) return bCount - aCount;
      if (!a.birthday) return 1;
      if (!b.birthday) return -1;
      return birthdayMonthDay(a.birthday) - birthdayMonthDay(b.birthday);
    });
  }, [artists]);

  return {
    weekBirthdayArtists,
    isLoading,
  };
};

export default useBirthdayArtists;
