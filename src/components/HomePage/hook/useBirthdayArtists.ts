import { useBirthdayArtistsQuery } from '@/hooks/useHomePage';
import useWeekData from './useWeekData';
import useTabState from './useTabState';
import { Artist } from '@/types';
import { useMemo } from 'react';
import { shouldShowBirthdayHat } from '@/utils/birthdayHelpers';

const useBirthdayArtists = () => {
  const { startDate, endDate } = useWeekData();
  const { activeTab } = useTabState();

  const { data: artists = [], isLoading } = useBirthdayArtistsQuery(startDate, endDate, {
    enabled: activeTab === 'birthday',
  });

  const weekBirthdayArtists = useMemo(() => {
    const todayArtists: Artist[] = [];
    const otherArtists: Artist[] = [];

    artists.forEach((artist) => {
      if (shouldShowBirthdayHat(artist.birthday ?? '')) {
        todayArtists.push(artist);
      } else {
        otherArtists.push(artist);
      }
    });

    // 當日壽星在前，其他按 API 原本的順序（已按生咖數量排序）
    return [...todayArtists, ...otherArtists];
  }, [artists]);

  return {
    weekBirthdayArtists,
    isLoading,
  };
};

export default useBirthdayArtists;
