'use client';

import { useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import Loading from '../Loading';
import { css } from '@/styled-system/css';
import FilterBar from './components/FilterBar';
import FavoritesList from './components/FavoritesList';
import { useFavorites } from './hooks/useFavorites';
import { QueryStateProvider, useQueryStateContextMergeUpdates } from '@/hooks/useQueryStateContext';
import { useSortBy, usePage, useShowOnlyActive, SortByOption } from './queryState';

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
});

const mainContainer = css({
  maxWidth: '600px',
  margin: '0 auto',
  padding: '100px 16px 40px',
  '@media (min-width: 768px)': {
    padding: '100px 24px 60px',
  },
});

const contentWrapper = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

function MyFavoritesContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { mergeUpdates } = useQueryStateContextMergeUpdates();

  const [showOnlyActive, setShowOnlyActive] = useShowOnlyActive();
  const [sortBy, setSortBy] = useSortBy();
  const [page, setPage] = usePage();

  // 把 sortBy 拆解為 sort 和 sortOrder
  const { sort, sortOrder } = useMemo((): {
    sort: 'favoritedAt' | 'startTime';
    sortOrder: 'asc' | 'desc';
  } => {
    const [field, order] = sortBy.split('-') as ['favorited' | 'startTime', 'asc' | 'desc'];
    return {
      sort: field === 'favorited' ? 'favoritedAt' : 'startTime',
      sortOrder: order,
    };
  }, [sortBy]);

  // 取得收藏列表
  const { data, isLoading, error } = useFavorites(
    {
      status: showOnlyActive ? 'notEnded' : 'all',
      sort,
      sortOrder,
      page,
      limit: 50,
    },
    !!user
  );

  const handleShowOnlyActiveChange = (show: boolean) => {
    mergeUpdates(() => {
      setShowOnlyActive(show);
      setPage(1);
    });
  };

  const handleSortByChange = (newSortBy: SortByOption) => {
    mergeUpdates(() => {
      setSortBy(newSortBy);
      setPage(1);
    });
  };

  // 權限檢查
  useEffect(() => {
    if (!authLoading && !user) {
      showToast.warning('請先登入後才能查看收藏的生日應援');
      router.push('/');
    }
  }, [user, authLoading, router]);

  const isLoadingState = authLoading || isLoading;

  if (!user) {
    return null;
  }

  if (error) {
    showToast.error('載入失敗，請稍後再試');
  }

  return (
    <div className={pageContainer}>
      <div className={mainContainer}>
        <div className={contentWrapper}>
          <FilterBar
            showOnlyActive={showOnlyActive}
            onShowOnlyActiveChange={handleShowOnlyActiveChange}
            sortBy={sortBy}
            onSortByChange={handleSortByChange}
          />

          {isLoadingState && <Loading description="載入中..." />}

          {!isLoadingState && data && (
            <FavoritesList data={data} currentPage={page} onPageChange={setPage} />
          )}
        </div>
      </div>
    </div>
  );
}

function MyFavorites() {
  return (
    <QueryStateProvider>
      <MyFavoritesContent />
    </QueryStateProvider>
  );
}

export default MyFavorites;
