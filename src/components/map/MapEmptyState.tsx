import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { MAP_EMPTY_DESC, MAP_EMPTY_TITLE } from './constants';

const emptyContent = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2',
});

const emptyIcon = css({
  color: 'color.text.disabled',
});

const emptyTitle = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
});

const emptyDesc = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  textAlign: 'center',
  whiteSpace: 'pre-line',
});

// Shared by the map bottom sheet and the overview page so the copy stays in one place
export default function MapEmptyState() {
  return (
    <div className={emptyContent}>
      <CalendarDaysIcon width={32} height={32} className={emptyIcon} />
      <p className={emptyTitle}>{MAP_EMPTY_TITLE}</p>
      <p className={emptyDesc}>{MAP_EMPTY_DESC}</p>
    </div>
  );
}
