'use client';

import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { css } from '@/styled-system/css';
import { venueApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';
import { useAuth } from '@/lib/auth-context';
import { usePageView } from '@/hooks/usePageView';
import { trackFilterVenues } from '@/lib/analytics/venues';
import type { Venue, CapacityRange } from '@/types';
import VenueFilters, { type CapacityFilter } from '@/components/venues/VenueFilters';
import VenueCard from '@/components/venues/VenueCard';
import VenueCardSkeleton from '@/components/venues/VenueCardSkeleton';

const SCROLL_KEY = 'venues_scrollY';

const page = css({
  minHeight: '100vh',
  background: 'color.background.primary',
  paddingTop: '70px',
});

const inner = css({
  maxWidth: '500px',
  margin: '0 auto',
  boxShadow: 'shadow.md',
});

const heroSection = css({
  paddingTop: '4',
  paddingX: '4',
  paddingBottom: '3',
  background: 'color.background.primary',
});

const title = css({
  marginTop: '0.5',
  marginX: '0',
  marginBottom: '1.5',
  textStyle: 'h3',
  fontWeight: 'bold',
  color: 'color.text.primary',
});

const subtitle = css({
  margin: 0,
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const countHighlight = css({
  color: 'color.primary',
  fontWeight: 'bold',
});

const listSection = css({
  padding: '4',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

const emptyState = css({
  paddingY: '10',
  paddingX: '5',
  textAlign: 'center',
  background: 'color.background.secondary',
  borderRadius: 'radius.lg',
  color: 'color.text.secondary',
  textStyle: 'bodySmall',
});

function applyCapacityFilter(venues: Venue[], cap: CapacityFilter): Venue[] {
  if (cap === 'all') return venues;
  return venues.filter((v) => v.capacityRange === (cap as CapacityRange));
}

interface VenuesClientProps {
  initialVenues: Venue[];
  totalCount: number;
}

export default function VenuesClient({ initialVenues, totalCount }: VenuesClientProps) {
  const { user } = useAuth();
  const [region, setRegion] = useState('全部');
  const [capacity, setCapacity] = useState<CapacityFilter>('all');
  const shouldTrackFilterChange = useRef(false);

  usePageView({ eventPage: '/venues' });

  // Derive available regions from SSR data (keeps only regions with actual venues)
  const regions = useMemo(() => {
    const unique = Array.from(new Set(initialVenues.map((v) => v.region))).sort();
    return ['全部', ...unique];
  }, [initialVenues]);

  const { data, isLoading } = useQuery({
    queryKey: queryKey.venues({ region }),
    queryFn: () =>
      venueApi.getVenues({
        region: region === '全部' ? undefined : [region],
        status: 'active',
      }),
    initialData: region === '全部' ? { venues: initialVenues } : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const venues = data?.venues ?? [];
  const filtered = applyCapacityFilter(venues, capacity);

  // Restore scroll position when navigating back from a venue detail page
  useLayoutEffect(() => {
    const savedY = sessionStorage.getItem(SCROLL_KEY);
    if (savedY !== null) {
      sessionStorage.removeItem(SCROLL_KEY);
      requestAnimationFrame(() => {
        window.scrollTo({ top: parseInt(savedY, 10), behavior: 'instant' });
      });
    }
  }, []);

  // Save scroll position when navigating away
  useEffect(() => {
    return () => {
      sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
    };
  }, []);

  useEffect(() => {
    if (!shouldTrackFilterChange.current || isLoading) {
      return;
    }

    trackFilterVenues({
      userId: user?.uid,
      filterRegion: region,
      filterCapacity: capacity,
      resultCount: filtered.length,
    });
    shouldTrackFilterChange.current = false;
  }, [capacity, filtered.length, isLoading, region, user?.uid]);

  const handleRegionChange = (nextRegion: string) => {
    if (nextRegion === region && capacity === 'all') return;

    shouldTrackFilterChange.current = true;
    setRegion(nextRegion);
    setCapacity('all');
  };

  const handleCapacityChange = (nextCapacity: CapacityFilter) => {
    if (nextCapacity === capacity) return;

    shouldTrackFilterChange.current = true;
    setCapacity(nextCapacity);
  };

  return (
    <div className={page}>
      <div className={inner}>
        <section className={heroSection}>
          <h1 className={title}>生咖、生日應援場地列表</h1>
          <p className={subtitle}>
            在 STELLAR 找到適合舉辦生咖、生日應援的空間！目前共收錄{' '}
            <strong className={countHighlight}>{totalCount}</strong> 個場地。
          </p>
        </section>

        <VenueFilters
          regions={regions}
          region={region}
          onRegionChange={handleRegionChange}
          capacity={capacity}
          onCapacityChange={handleCapacityChange}
        />

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isLoading ? '載入中' : `找到 ${filtered.length} 個場地`}
        </div>

        <section aria-label="場地列表" className={listSection}>
          {isLoading ? (
            Array.from({ length: 6 }, (_, i) => <VenueCardSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className={emptyState}>沒有符合條件的場地。試試調整地區或容納人數。</div>
          ) : (
            filtered.map((venue, index) => (
              <VenueCard key={venue.id} venue={venue} listPosition={index + 1} userId={user?.uid} />
            ))
          )}
        </section>
      </div>
    </div>
  );
}
