import { css } from '@/styled-system/css';

const paginationContainer = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '3',
  paddingY: '5',
  paddingX: '4',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
});

const paginationButton = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  paddingY: '2',
  paddingX: '4',
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

type SubmissionsPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const SubmissionsPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: SubmissionsPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onPageChange(newPage);
  };

  return (
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
        第 {currentPage} / {totalPages} 頁
      </span>

      <button
        type="button"
        className={paginationButton}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="前往下一頁"
      >
        下一頁
      </button>
    </nav>
  );
};

export default SubmissionsPagination;
