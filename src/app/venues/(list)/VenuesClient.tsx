'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { css } from '@/styled-system/css';
import { venueApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';
import { useAuth } from '@/lib/auth-context';
import { usePageView } from '@/hooks/usePageView';
import { trackFilterVenues } from '@/lib/analytics/venues';
import { useQueryState } from '@/hooks/useQueryState';
import { useQueryStateContextMergeUpdates } from '@/hooks/useQueryStateContext';
import { parseVenueCapacity, parseVenuePage, parseVenueSort } from '@/utils/venues';
import VenueFilters, {
  type CapacityFilter,
  type VenueSort,
} from '@/components/venues/VenueFilters';
import VenueCard from '@/components/venues/VenueCard';
import VenueCardSkeleton from '@/components/venues/VenueCardSkeleton';
import SubmissionsPagination from '@/components/ui/SubmissionsPagination';

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

const retryButton = css({
  marginTop: '3',
  paddingY: '2',
  paddingX: '4',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  color: 'color.primary',
  cursor: 'pointer',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
});

interface VenuesClientProps {
  // Precomputed server-side (see page.tsx) from a large, unpaginated fetch — kept
  // separate from the paginated list query so the two concerns don't get conflated.
  regions: string[];
}

const PAGE_LIMIT = 20;

export default function VenuesClient({ regions }: VenuesClientProps) {
  const { user } = useAuth();
  const { mergeUpdates } = useQueryStateContextMergeUpdates();

  const [region, setRegion] = useQueryState('region', {
    parse: (value: string) => value,
    defaultValue: '全部',
  });
  const [capacity, setCapacity] = useQueryState<CapacityFilter>('capacity', {
    parse: parseVenueCapacity,
    defaultValue: 'all',
  });
  const [search, setSearch] = useQueryState('q', {
    parse: (value: string) => value,
    defaultValue: '',
  });
  const [sort, setSort] = useQueryState<VenueSort>('sort', {
    parse: parseVenueSort,
    defaultValue: 'newest',
  });
  const [pageNum, setPageNum] = useQueryState<number>('page', {
    parse: parseVenuePage,
    defaultValue: 1,
  });

  const shouldTrackFilterChange = useRef(false);

  usePageView({ eventPage: '/venues' });

  const queryParams = {
    region: region === '全部' ? undefined : [region],
    capacityRange: capacity === 'all' ? undefined : capacity,
    search: search || undefined,
    sort,
    page: pageNum,
    limit: PAGE_LIMIT,
    status: 'active' as const,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKey.venues({
      region: region === '全部' ? undefined : region,
      capacityRange: queryParams.capacityRange,
      search: queryParams.search,
      sort,
      page: pageNum,
    }),
    queryFn: () => venueApi.getVenues(queryParams),
    staleTime: 5 * 60 * 1000,
  });

  const venues = data?.venues ?? [];
  const pagination = data?.pagination;

  // Restore scroll position on back navigation (popstate fires even when component is cached)
  useEffect(() => {
    const restore = () => {
      const savedY = sessionStorage.getItem(SCROLL_KEY);
      if (savedY !== null) {
        sessionStorage.removeItem(SCROLL_KEY);
        requestAnimationFrame(() => {
          window.scrollTo({ top: parseInt(savedY, 10), behavior: 'instant' });
        });
      }
    };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  useEffect(() => {
    if (!shouldTrackFilterChange.current || isLoading) {
      return;
    }

    trackFilterVenues({
      userId: user?.uid,
      filterRegion: region,
      filterCapacity: capacity,
      searchQuery: search,
      resultCount: venues.length,
    });
    shouldTrackFilterChange.current = false;
  }, [capacity, isLoading, region, search, user?.uid, venues.length]);

  // Region and capacity are fully independent filters (2026-08-03 使用者裁定推翻
  // 原「切換地區重置容納人數」的既有行為) — changing one never touches the other,
  // only `page` resets on any single-filter change.
  const handleRegionChange = (nextRegion: string) => {
    if (nextRegion === region) return;

    shouldTrackFilterChange.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mergeUpdates(() => {
      setRegion(nextRegion === '全部' ? null : nextRegion);
      setPageNum(null);
    });
  };

  const handleCapacityChange = (nextCapacity: CapacityFilter) => {
    if (nextCapacity === capacity) return;

    shouldTrackFilterChange.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mergeUpdates(() => {
      setCapacity(nextCapacity === 'all' ? null : nextCapacity);
      setPageNum(null);
    });
  };

  const handleSearchChange = (nextSearch: string) => {
    if (nextSearch === search) return;

    shouldTrackFilterChange.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mergeUpdates(() => {
      setSearch(nextSearch || null);
      setPageNum(null);
    });
  };

  const handleSortChange = (nextSort: VenueSort) => {
    if (nextSort === sort) return;

    sessionStorage.removeItem(SCROLL_KEY);
    // 2026-08-03 使用者裁定推翻原「排序切換不 scroll to top」的行為，統一為所有篩選
    // 條件改變都 scroll to top。
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mergeUpdates(() => {
      setSort(nextSort === 'newest' ? null : nextSort);
      setPageNum(null);
    });
  };

  const handlePageChange = (nextPage: number) => {
    setPageNum(nextPage === 1 ? null : nextPage);
  };

  // 「清除篩選」：一次重置 region/capacity/q/page，sort 是使用者的瀏覽偏好不受影響。
  const handleClearFilters = () => {
    shouldTrackFilterChange.current = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mergeUpdates(() => {
      setRegion(null);
      setCapacity(null);
      setSearch(null);
      setPageNum(null);
    });
  };

  return (
    <div className={page}>
      <div className={inner}>
        <section className={heroSection}>
          <h1 className={title}>生咖、生日應援場地列表</h1>
          <p className={subtitle}>在 STELLAR 找到適合舉辦生咖、生日應援的空間！</p>
        </section>

        <VenueFilters
          regions={regions}
          region={region}
          onRegionChange={handleRegionChange}
          capacity={capacity}
          onCapacityChange={handleCapacityChange}
          search={search}
          onSearchChange={handleSearchChange}
          sort={sort}
          onSortChange={handleSortChange}
          onClearFilters={handleClearFilters}
        />

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isLoading ? '載入中' : `找到 ${venues.length} 個場地`}
        </div>

        <section aria-label="場地列表" className={listSection}>
          {isError ? (
            <div className={emptyState}>
              載入場地列表失敗，請重新整理頁面
              <div>
                <button type="button" className={retryButton} onClick={() => refetch()}>
                  重試
                </button>
              </div>
            </div>
          ) : isLoading ? (
            Array.from({ length: 6 }, (_, i) => <VenueCardSkeleton key={i} />)
          ) : venues.length === 0 ? (
            <div className={emptyState}>
              沒有符合條件的場地。試試調整地區、容納人數或搜尋關鍵字。
            </div>
          ) : (
            venues.map((venue, index) => (
              <VenueCard key={venue.id} venue={venue} listPosition={index + 1} userId={user?.uid} />
            ))
          )}
        </section>

        {!isLoading && !isError && pagination && (
          <SubmissionsPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
