import { useWeeklyEventsQuery } from '@/hooks/useHomePage';
import useWeekData from './useWeekData';
import useTabState from './useTabState';

const useWeeklyEvents = () => {
  const { eventStartDate, endDateISO } = useWeekData();
  const { activeTab } = useTabState();

  const { data: eventsResponse, isLoading } = useWeeklyEventsQuery(eventStartDate, endDateISO, {
    enabled: activeTab === 'events',
  });

  return {
    weeklyEvents: eventsResponse?.events || [],
    isLoading,
  };
};

export default useWeeklyEvents;
