import { css } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';

const card = css({
  borderRadius: 'radius.lg',
  border: '1px solid',
  borderColor: 'color.border.light',
  overflow: 'hidden',
  background: 'color.background.primary',
  boxShadow: 'shadow.sm',
});

const body = css({
  padding: '3',
});

const nameRow = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '2.5',
});

const locationRow = css({
  marginTop: '2',
});

const statsRow = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '2.5',
  paddingTop: '2.5',
  borderTop: '1px dashed',
  borderTopColor: 'color.border.light',
});

export default function VenueCardSkeleton() {
  return (
    <div className={card}>
      <Skeleton height="220px" borderRadius="0" />
      <div className={body}>
        <div className={nameRow}>
          <Skeleton width="55%" height="16px" borderRadius="4px" />
          <Skeleton width="48px" height="20px" borderRadius="4px" />
        </div>
        <div className={locationRow}>
          <Skeleton width="45%" height="12px" borderRadius="4px" />
        </div>
        <div className={statsRow}>
          <Skeleton width="90px" height="12px" borderRadius="4px" />
          <Skeleton width="60px" height="12px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
}
