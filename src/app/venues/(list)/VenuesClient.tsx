'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { css } from '@/styled-system/css';
import { venueApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';
import { useAuth } from '@/lib/auth-context';
import { usePageView } from '@/hooks/usePageView';
import { useIsInAppBrowser } from '@/hooks/useIsInAppBrowser';
import { trackFilterVenues, trackSortVenues } from '@/lib/analytics/venues';
import { showToast } from '@/lib/toast';
import { useQueryState } from '@/hooks/useQueryState';
import { useQueryStateContext } from '@/hooks/useQueryStateContext';
import { parseVenueCapacity, parseVenuePage, parseVenueSort } from '@/utils/venues';
import {
  useVenueDistanceSort,
  type VenueGeolocationSource,
} from '@/components/venues/hooks/useVenueDistanceSort';
import VenueFilters, {
  type CapacityFilter,
  type VenueSort,
} from '@/components/venues/VenueFilters';
import VenueCard from '@/components/venues/VenueCard';
import VenueCardSkeleton from '@/components/venues/VenueCardSkeleton';
import SubmissionsPagination from '@/components/ui/SubmissionsPagination';
import ApiErrorState from '@/components/ui/ApiErrorState';

// 定位失敗的 toast 文案（design-frontend.md「畫面規格 → 失敗提示」）：拒絕權限才有
// 「去瀏覽器設定重新開啟」的專屬引導，不支援／逾時共用同一句通用訊息。
const LOCATION_DENIED_MESSAGE =
  '你拒絕了定位權限，已改用綜合排序。如需使用「距離最近」，請至瀏覽器設定重新開啟定位權限。';
const LOCATION_UNAVAILABLE_MESSAGE = '目前無法取得你的位置，已改用綜合排序。';
const LOCATION_TOAST_DURATION_MS = 5000;

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

// 僅在「尚未取得座標、等待定位中」時顯示（design-frontend.md「列表載入狀態」）；
// 一旦座標到手、進入單純的 API fetch 階段就不再顯示，畫面回到純 skeleton。
const locationPrompt = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  textAlign: 'center',
  marginBottom: '1',
});

interface VenuesClientProps {
  // Precomputed server-side (see page.tsx) from a large, unpaginated fetch — kept
  // separate from the paginated list query so the two concerns don't get conflated.
  regions: string[];
}

const PAGE_LIMIT = 20;

export default function VenuesClient({ regions }: VenuesClientProps) {
  const { user } = useAuth();
  const { params: rawParams, mergeUpdates } = useQueryStateContext();

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
    defaultValue: 'composite',
  });
  const [pageNum, setPageNum] = useQueryState<number>('page', {
    parse: parseVenuePage,
    defaultValue: 1,
  });

  const shouldTrackFilterChange = useRef(false);

  usePageView({ eventPage: '/venues' });

  // 帶不合法 `sort` 值的 URL（如 ?sort=foo）：不只是用預設值渲染，還要把網址列的亂碼值
  // 清掉（router.replace 語意，不留 history entry），比照「清除篩選」對不合法值的處理方式
  // （2026-09 裁定）。用 raw params 而非已解析的 `sort`，因為 parseVenueSort 對不合法值
  // 也會 fallback 為 'composite'，兩者無法從解析後的值反推「原本網址是否合法」。
  useEffect(() => {
    const rawSort = rawParams.sort;
    if (rawSort !== undefined && parseVenueSort(rawSort) !== rawSort) {
      setSort(null);
    }
  }, [rawParams.sort, setSort]);

  // ─── venue-distance-sort：IAB 判斷與定位協調 ────────────────────────────
  const { isInAppBrowser, loading: isInAppBrowserLoading } = useIsInAppBrowser();
  const { coords, resolveGeolocation } = useVenueDistanceSort();
  const [isAwaitingLocation, setIsAwaitingLocation] = useState(false);

  // 給 async 的定位結果 callback 讀「當下」的 sort，判斷使用者是否已經切走
  // （design-frontend.md「快速連續切換排序」edge case：稍後才回來的結果一律丟棄 UI 套用，
  // 但座標仍寫入記憶體快取、GA 事件仍照常送出，由 useVenueDistanceSort 自己保證）。
  const sortRef = useRef(sort);
  useEffect(() => {
    sortRef.current = sort;
  }, [sort]);

  // Codex 第三輪 code review（情境 C）：`mergeUpdates`／`setSort` 都是 useCallback
  // 包過的函式，依賴 `params`——使用者每改一次篩選，context 就會重新產生一份新的
  // `mergeUpdates`/`setSort`。但 `triggerDistanceSort` 的 `.then()` callback 是在
  // 「發起定位請求的那一刻」就把當下的 `mergeUpdates`/`setSort` 閉包凍結起來，等定位
  // 結果非同步回來時再呼叫——若使用者在等待期間改了地區/容納人數/搜尋，這個閉包仍是
  // 「發起時」那份舊的 `mergeUpdates`，裡面關閉的 `params` 也是舊的，呼叫它會把使用者
  // 後來的篩選變更整個蓋回舊值，只是想清掉 `sort` 卻連帶還原了篩選。改用 ref 讓 `.then()`
  // 永遠讀「呼叫當下最新」的 `mergeUpdates`/`setSort`，而不是「發起定位請求那一刻」的。
  const mergeUpdatesRef = useRef(mergeUpdates);
  useEffect(() => {
    mergeUpdatesRef.current = mergeUpdates;
  }, [mergeUpdates]);
  const setSortRef = useRef(setSort);
  useEffect(() => {
    setSortRef.current = setSort;
  }, [setSort]);

  // 同一輪 review（情境 C）：元件若在定位 pending 期間卸載（如使用者離開 /venues），
  // 定位結果回來時不該再改 URL／跳 toast——GA 事件不受這個guard 影響，照常送出
  // （由 useVenueDistanceSort 內部無條件處理，與這裡的 UI 副作用是兩件事）。
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const triggerDistanceSort = useCallback(
    (source: VenueGeolocationSource) => {
      if (coords || isAwaitingLocation) return;
      setIsAwaitingLocation(true);
      resolveGeolocation(user?.uid, source).then((result) => {
        if (!isMountedRef.current) return;
        setIsAwaitingLocation(false);
        // 使用者已經切到其他排序：GA 事件已經送出、座標（若成功）已經快取，
        // 這裡不再套用任何 UI 效果（不顯示 toast、不改動 URL/排序）。
        if (sortRef.current !== 'distance') return;
        if (result.status === 'granted') return;

        showToast.warning(
          result.status === 'denied' ? LOCATION_DENIED_MESSAGE : LOCATION_UNAVAILABLE_MESSAGE,
          { duration: LOCATION_TOAST_DURATION_MS }
        );
        mergeUpdatesRef.current(() => {
          setSortRef.current(null);
        });
      });
    },
    [coords, isAwaitingLocation, resolveGeolocation, user?.uid]
  );

  // IAB 判斷完成前不出手（避免在未知環境下誤觸定位）；判定為 IAB 時清除 URL 的
  // sort=distance（design-frontend.md 流程 C）；判定為非 IAB 且尚無座標時，視同
  // 使用者剛點了「距離最近」（流程 D：分享連結進站）。
  useEffect(() => {
    if (sort !== 'distance' || isInAppBrowserLoading) return;
    if (isInAppBrowser) {
      mergeUpdates(() => setSort(null));
      return;
    }
    if (coords || isAwaitingLocation) return;
    // Kicking off the actual geolocation request (and its isAwaitingLocation flag) is
    // the whole point of this effect reacting to IAB resolution + URL sort=distance —
    // not a derived-state calculation that belongs in render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    triggerDistanceSort('share_link');
  }, [
    sort,
    isInAppBrowserLoading,
    isInAppBrowser,
    coords,
    isAwaitingLocation,
    triggerDistanceSort,
    mergeUpdates,
    setSort,
  ]);

  // distance 排序必須有座標才能送出請求（缺座標送出會被後端 400）；IAB 或座標未就緒
  // 時暫停查詢，畫面改走下方的「等待定位」skeleton。
  const canFetchDistance = !isInAppBrowserLoading && !isInAppBrowser && !!coords;
  const waitingForLocation = sort === 'distance' && !canFetchDistance;
  // 「正在取得你的位置…」提示文字只在「確定非 IAB、且還沒有座標」時出現——IAB 判斷中
  // 或已取得座標時都不顯示（design-frontend.md「列表載入狀態」）。
  const showLocationPrompt =
    sort === 'distance' && !isInAppBrowserLoading && !isInAppBrowser && !coords;

  const queryParams = {
    region: region === '全部' ? undefined : [region],
    capacityRange: capacity === 'all' ? undefined : capacity,
    search: search || undefined,
    // 'composite' 是新預設值，不送給後端（比照 region/capacityRange 預設值不送的既有慣例）；
    // 後端未帶 sort 時本就等同 composite。
    sort: sort === 'composite' ? undefined : sort,
    lat: sort === 'distance' && coords ? coords.lat : undefined,
    lng: sort === 'distance' && coords ? coords.lng : undefined,
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
      lat: queryParams.lat,
      lng: queryParams.lng,
    }),
    queryFn: () => venueApi.getVenues(queryParams),
    // distance 排序沒有座標前不送出請求（送出會被後端 400）；其他排序一律照常。
    enabled: sort !== 'distance' || canFetchDistance,
    staleTime: 5 * 60 * 1000,
  });

  const venues = data?.venues ?? [];
  const pagination = data?.pagination;
  const isLoadingList = isLoading || waitingForLocation;

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

    // resultCount reflects the list as filtered under the sort about to be replaced,
    // not the (not-yet-fetched) result of the new sort — see tracking.md L210.
    trackSortVenues({
      userId: user?.uid,
      sortFrom: sort,
      sortTo: nextSort,
      filterRegion: region,
      filterCapacity: capacity,
      searchQuery: search,
      resultCount: venues.length,
    });

    sessionStorage.removeItem(SCROLL_KEY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    mergeUpdates(() => {
      setSort(nextSort === 'composite' ? null : nextSort);
      setPageNum(null);
    });

    // URL/trigger 文字立即反映新選項，不等待定位結果（design-frontend.md 流程 A 第 2
    // 步）；已有快取座標時 triggerDistanceSort 內部會直接 no-op。
    if (nextSort === 'distance') {
      triggerDistanceSort('menu_select');
    }
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
          {isLoadingList ? '載入中' : `找到 ${venues.length} 個場地`}
        </div>

        <section aria-label="場地列表" className={listSection}>
          {isError ? (
            <ApiErrorState message="載入場地列表失敗，請重新整理頁面" onRetry={() => refetch()} />
          ) : isLoadingList ? (
            <>
              {showLocationPrompt && (
                <p className={locationPrompt} role="status" aria-live="polite">
                  正在取得你的位置…
                </p>
              )}
              {Array.from({ length: 6 }, (_, i) => (
                <VenueCardSkeleton key={i} />
              ))}
            </>
          ) : venues.length === 0 ? (
            <div className={emptyState}>
              沒有符合條件的場地。試試調整地區、容納人數或搜尋關鍵字。
            </div>
          ) : (
            venues.map((venue, index) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                listPosition={index + 1}
                userId={user?.uid}
                listSort={sort}
                userCoords={coords}
                isInAppBrowser={isInAppBrowser}
              />
            ))
          )}
        </section>

        {!isLoadingList && !isError && pagination && (
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
