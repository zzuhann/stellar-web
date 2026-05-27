'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { css } from '@/styled-system/css';
import { venueApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';
import type { Venue, CapacityRange } from '@/types';
import VenueFilters, { type CapacityFilter } from '@/components/venues/VenueFilters';
import VenueCard from '@/components/venues/VenueCard';

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
  padding: '18px 16px 14px',
  background: 'color.background.primary',
});

const eyebrow = css({
  fontSize: '11px',
  color: 'color.text.secondary',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
});

const title = css({
  margin: '2px 0 6px',
  fontSize: '22px',
  fontWeight: 700,
  color: 'color.text.primary',
  lineHeight: 1.3,
});

const subtitle = css({
  margin: 0,
  fontSize: '13px',
  color: 'color.text.secondary',
  lineHeight: 1.55,
});

const countHighlight = css({
  color: 'color.primary',
  fontWeight: 700,
});

const listSection = css({
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
});

const emptyState = css({
  padding: '40px 20px',
  textAlign: 'center',
  background: 'color.background.secondary',
  borderRadius: 'radius.lg',
  color: 'color.text.secondary',
  fontSize: '13px',
});

const loadingState = css({
  padding: '60px 20px',
  textAlign: 'center',
  color: 'color.text.secondary',
  fontSize: '13px',
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
  const [region, setRegion] = useState('全部');
  const [capacity, setCapacity] = useState<CapacityFilter>('all');

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

  return (
    <div className={page}>
      <div className={inner}>
        <section className={heroSection}>
          <div className={eyebrow}>Venues</div>
          <h1 className={title}>場地索引</h1>
          <p className={subtitle}>
            找適合舉辦生咖、生日應援的咖啡廳、酒吧、書店、展演空間。共{' '}
            <strong className={countHighlight}>{totalCount}</strong> 個場地。
          </p>
        </section>

        <VenueFilters
          region={region}
          onRegionChange={(r) => {
            setRegion(r);
            setCapacity('all');
          }}
          capacity={capacity}
          onCapacityChange={setCapacity}
        />

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isLoading ? '載入中' : `找到 ${filtered.length} 個場地`}
        </div>

        <section aria-label="場地列表" className={listSection}>
          {isLoading ? (
            <div className={loadingState}>載入中…</div>
          ) : filtered.length === 0 ? (
            <div className={emptyState}>沒有符合條件的場地。試試調整地區或容納人數。</div>
          ) : (
            filtered.map((venue) => <VenueCard key={venue.id} venue={venue} />)
          )}
        </section>
      </div>
    </div>
  );
}
