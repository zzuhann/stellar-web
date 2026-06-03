import * as Sentry from '@sentry/nextjs';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import HomePage from '@/components/HomePage';
import { artistsApi, eventsApi } from '@/lib/api';
import { getWeekStart, getWeekEnd, formatDateForAPI } from '@/utils/weekHelpers';
import queryKey from '@/hooks/queryKey';
import { Suspense } from 'react';
import Loading from '@/components/Loading';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.stellar-zone.com/',
  },
};

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
      queryClient.prefetchQuery({
        queryKey: queryKey.trendingEvents(10),
        queryFn: () => eventsApi.getTrending(10),
        staleTime: 1000 * 60 * 60 * 6,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKey.topArtists(50),
        queryFn: () => artistsApi.getTop(50),
        staleTime: 1000 * 60 * 60 * 6,
      }),
    ]);
  } catch (error) {
    Sentry.captureException(error, { tags: { context: 'homepage_prefetch' } });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loading style={{ height: '100dvh' }} />}>
        <HomePage />
      </Suspense>
    </HydrationBoundary>
  );
}
