'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import Loading from '../Loading';
import { css } from '@/styled-system/css';
import FilterBar from './components/FilterBar';
import FavoritesList from './components/FavoritesList';
import { useFavorites } from './hooks/useFavorites';
import { QueryStateProvider, useQueryStateContextMergeUpdates } from '@/hooks/useQueryStateContext';
import { useSortBy, useArtistId, useShowOnlyActive } from './queryState';
import { buildFavoriteList } from '@/utils/favoriteList';

const pageContainer = css({ minHeight: '100dvh', background: 'color.background.primary' });
const mainContainer = css({
  maxWidth: '600px',
  margin: '0 auto',
  paddingTop: '25',
  paddingX: '4',
  paddingBottom: '10',
});
const content = css({ display: 'flex', flexDirection: 'column', gap: '3' });
const title = css({ textStyle: 'h1', color: 'color.text.primary', marginBottom: '2' });
const summary = css({ textStyle: 'bodySmall', color: 'color.text.secondary' });
const errorBox = css({ textStyle: 'bodySmall', color: 'color.status.error' });
const retryButton = css({
  minHeight: '44px',
  paddingX: '3',
  textDecoration: 'underline',
  cursor: 'pointer',
});

function MyFavoritesContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { mergeUpdates } = useQueryStateContextMergeUpdates();
  const [showOnlyActive, setShowOnlyActive] = useShowOnlyActive();
  const [sortBy, setSortBy] = useSortBy();
  const [artistId, setArtistId] = useArtistId();
  const { data, isLoading, error, refetch, isFetching } = useFavorites(user?.uid);
  const { events, artists, total } = buildFavoriteList(data ?? [], {
    artistId,
    showOnlyActive,
    sortBy,
  });

  const resetFilters = () =>
    mergeUpdates(() => {
      setArtistId('');
      setShowOnlyActive(false);
    });

  useEffect(() => {
    if (!authLoading && !user) {
      showToast.warning('請先登入後查看「我想去」');
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading) return <Loading description="載入中..." />;
  if (!user) return null;

  return (
    <div className={pageContainer}>
      <main className={mainContainer}>
        <div className={content}>
          <h1 className={title}>我想去的生日應援</h1>
          {isLoading && <Loading description="載入中..." />}
          {error && (
            <div className={errorBox} role="alert">
              <p>{data ? '更新失敗，目前顯示上次載入的清單。' : '載入失敗，請稍後再試。'}</p>
              <button
                type="button"
                className={retryButton}
                disabled={isFetching}
                onClick={() => void refetch()}
              >
                重新載入
              </button>
            </div>
          )}
          {data && (
            <>
              <FilterBar
                artists={artists}
                artistId={artistId}
                onArtistChange={setArtistId}
                showOnlyActive={showOnlyActive}
                onShowOnlyActiveChange={setShowOnlyActive}
                sortBy={sortBy}
                onSortByChange={setSortBy}
              />
              <p className={summary} aria-live="polite">
                共 {total} 場生日應援
              </p>
              <FavoritesList
                events={events}
                artistId={artistId}
                hasFavorites={data.length > 0}
                onReset={resetFilters}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
export default function MyFavorites() {
  return (
    <QueryStateProvider>
      <MyFavoritesContent />
    </QueryStateProvider>
  );
}
