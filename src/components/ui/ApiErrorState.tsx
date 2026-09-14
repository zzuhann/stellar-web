import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';

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
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1.5',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  color: 'color.primary',
  cursor: 'pointer',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
});

const retryButtonIcon = css({
  width: '16px',
  height: '16px',
});

interface ApiErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ApiErrorState({ message, onRetry }: ApiErrorStateProps) {
  return (
    <div className={emptyState}>
      {message}
      <div>
        <button type="button" className={retryButton} onClick={onRetry}>
          <ArrowPathIcon className={retryButtonIcon} aria-hidden="true" />
          重試
        </button>
      </div>
    </div>
  );
}
