import { css } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';
import {
  VENUE_CARD_BODY_MIN_HEIGHT,
  VENUE_HOME_CARD_BODY_MIN_HEIGHT,
  VENUE_HOME_CARD_COVER_HEIGHT,
} from './venueCardLayout';

const card = css({
  height: '100%',
  borderRadius: 'radius.lg',
  border: '1px solid',
  borderColor: 'color.border.light',
  overflow: 'hidden',
  background: 'color.background.primary',
  boxShadow: 'shadow.sm',
});

// Same ratios as VenueCardCover so the swap to a real card does not move anything
const listCover = css({
  aspectRatio: '16 / 10',
  '@media (min-width: 768px)': { aspectRatio: '4 / 3' },
});

const body = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  paddingX: '4',
  paddingY: '3',
});

const nameRow = css({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '2',
});

const tagRow = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.5',
});

const sectionDivider = css({
  borderTop: '1px dashed',
  borderColor: 'gray.200',
});

const bottomStats = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

interface VenueCardSkeletonProps {
  variant?: 'list' | 'home';
}

// Assumes a full card (transit, tags, bottom), the shape most real cards have
export default function VenueCardSkeleton({ variant = 'list' }: VenueCardSkeletonProps) {
  const isHome = variant === 'home';
  return (
    <div className={card}>
      {isHome ? (
        <Skeleton height={VENUE_HOME_CARD_COVER_HEIGHT} borderRadius="0" />
      ) : (
        <div className={listCover}>
          <Skeleton height="100%" borderRadius="0" />
        </div>
      )}
      <div
        className={body}
        style={{ minHeight: isHome ? VENUE_HOME_CARD_BODY_MIN_HEIGHT : VENUE_CARD_BODY_MIN_HEIGHT }}
      >
        <div className={nameRow}>
          {/* 48px = two lines of the 16px/1.5 venue name */}
          <Skeleton width="60%" height="48px" borderRadius="4px" />
          <Skeleton width="40px" height="24px" borderRadius="9999px" />
        </div>
        <Skeleton width="140px" height="18px" borderRadius="4px" />
        <div className={tagRow}>
          <Skeleton width="64px" height="22px" borderRadius="4px" />
          <Skeleton width="72px" height="22px" borderRadius="4px" />
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className={sectionDivider} />
          <div className={bottomStats}>
            <Skeleton width="90px" height="21px" borderRadius="4px" />
            {!isHome && <Skeleton width="100px" height="21px" borderRadius="4px" />}
          </div>
        </div>
      </div>
    </div>
  );
}
