import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import HomePage from '@/components/HomePage';
import { artistsApi, eventsApi } from '@/lib/api';
import { getWeekStart, getWeekEnd, formatDateForAPI } from '@/utils/weekHelpers';
import queryKey from '@/hooks/queryKey';

export default async function Home() {
  const queryClient = new QueryClient();

  // 計算當前週的日期範圍
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(weekStart);
  const startDate = formatDateForAPI(weekStart);
  const endDate = formatDateForAPI(weekEnd);

  // 對於 events，從今天開始（避免顯示已結束的活動）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventStartDate = today.toISOString();
  const endDateISO = new Date(weekEnd.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString();

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKey.birthdayArtists(startDate, endDate),
        queryFn: () =>
          artistsApi.getAll({
            status: 'approved',
            birthdayStartDate: startDate,
            birthdayEndDate: endDate,
            sortBy: 'coffeeEventCount',
            sortOrder: 'desc',
          }),
        staleTime: 1000 * 60 * 5,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKey.weeklyEvents(eventStartDate, endDateISO),
        queryFn: () =>
          eventsApi.getAll({
            status: 'approved',
            startTimeFrom: eventStartDate,
            startTimeTo: endDateISO,
            sortBy: 'startTime',
            sortOrder: 'asc',
          }),
        staleTime: 1000 * 60 * 5,
      }),
    ]);
  } catch {}

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePage />
    </HydrationBoundary>
  );
}
