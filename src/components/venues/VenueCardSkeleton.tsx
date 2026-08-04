import { css } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';
import { VENUE_CARD_BODY_MIN_HEIGHT } from './venueCardLayout';

const card = css({
  borderRadius: 'radius.lg',
  border: '1px solid',
  borderColor: 'color.border.light',
  overflow: 'hidden',
  background: 'color.background.primary',
  boxShadow: 'shadow.sm',
});

const body = css({
  paddingTop: '3',
  paddingX: '3',
  paddingBottom: '3',
  // 與 VenueCard.tsx 共用同一常數（見 venueCardLayout.ts）
  minHeight: VENUE_CARD_BODY_MIN_HEIGHT,
});

const nameRow = css({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '2',
});

const mrtRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  marginTop: '2',
});

const hostTagsRow = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2',
  marginTop: '2',
});

const sectionDivider = css({
  borderTop: '1px dashed',
  borderColor: 'gray.200',
  marginY: '2',
});

const bottomStats = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

// 固定假設「資料齊全」情境（有 MRT/主辦標籤/統計列），比精簡版更貼近多數卡片實際高度，減少 CLS
export default function VenueCardSkeleton() {
  return (
    <div className={card}>
      <Skeleton height="220px" borderRadius="0" />
      <div className={body}>
        <div className={nameRow}>
          {/* 40px 對應 VenueCard.tsx venueName 兩行 clamp 的高度 */}
          <Skeleton width="60%" height="40px" borderRadius="4px" />
          <Skeleton width="40px" height="24px" borderRadius="9999px" />
        </div>

        <div className={mrtRow}>
          <Skeleton width="14px" height="14px" borderRadius="9999px" />
          <Skeleton width="120px" height="16px" borderRadius="4px" />
        </div>

        <div className={hostTagsRow}>
          <Skeleton width="56px" height="24px" borderRadius="9999px" />
          <Skeleton width="64px" height="24px" borderRadius="9999px" />
          <Skeleton width="48px" height="24px" borderRadius="9999px" />
        </div>

        <div className={sectionDivider} />

        <div className={bottomStats}>
          <Skeleton width="90px" height="16px" borderRadius="4px" />
          <Skeleton width="100px" height="16px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
}
