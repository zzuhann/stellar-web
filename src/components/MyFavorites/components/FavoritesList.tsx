import { FavoritesResponse } from '@/types';
import { css } from '@/styled-system/css';
import VerticalEventCard from '@/components/EventCard/VerticalEventCard';
import CardHeader from './CardHeader';
import { contentCard } from './styles';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/EmptyState';

const eventGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '16px',
  padding: '16px',
});

const paginationContainer = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '12px',
  padding: '20px 16px',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
});

const paginationButton = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  padding: '8px 16px',
  borderRadius: 'radius.md',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.primary',
  transition: 'all 0.2s ease',
  '&:hover:not(:disabled)': {
    borderColor: 'color.primary',
    color: 'color.primary',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const pageInfo = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const ctaButton = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  padding: '12px 24px',
  borderRadius: 'radius.lg',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  background: 'color.primary',
  borderColor: 'color.primary',
  color: 'white',
  maxWidth: '60%',
  margin: '16px auto 0 auto',
  '&:hover': {
    background: 'stellarBlue.600',
    borderColor: 'stellarBlue.600',
  },
});

type FavoritesListProps = {
  data: FavoritesResponse;
  currentPage: number;
  onPageChange: (page: number) => void;
};

const FavoritesList = ({ data, currentPage, onPageChange }: FavoritesListProps) => {
  const router = useRouter();
  const { favorites, pagination } = data;

  const handlePageChange = (newPage: number) => {
    // 滾動到頁面最上方
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onPageChange(newPage);
  };

  if (favorites.length === 0) {
    return (
      <div className={contentCard}>
        <CardHeader title="我的收藏" description="還沒有收藏任何活動" />
        <EmptyState
          icon="🕵️‍♀️"
          title="還沒有收藏任何生日應援"
          description="快去收藏你喜歡的生日應援吧 ✨"
          cta={
            <button type="button" className={ctaButton} onClick={() => router.push('/')}>
              前往首頁
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className={contentCard}>
      <CardHeader title="我的收藏" description={`共收藏 ${pagination.total} 個生日應援`} />

      <div className={eventGrid}>
        {favorites.map(({ event }) => (
          <VerticalEventCard key={event.id} event={event} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <nav aria-label="切換分頁" className={paginationContainer}>
          <button
            type="button"
            className={paginationButton}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="前往上一頁"
          >
            上一頁
          </button>

          <span className={pageInfo} aria-live="polite" aria-atomic="true">
            第 {currentPage} / {pagination.totalPages} 頁
          </span>

          <button
            type="button"
            className={paginationButton}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages}
            aria-label="前往下一頁"
          >
            下一頁
          </button>
        </nav>
      )}
    </div>
  );
};

export default FavoritesList;
