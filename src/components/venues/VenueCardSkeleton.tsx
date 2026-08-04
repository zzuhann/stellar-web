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
  // 跟 VenueCard.tsx 共用同一個常數（見 venueCardLayout.ts），確保 skeleton 跟真實
  // 卡片本身的最小高度永遠一致，而不只是碰巧算出差不多的數字。
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

// 對照 VenueCard.tsx：mrtRow/hostTagsRow/divider/bottomStats 在真實卡片是依資料
// 有無條件渲染。Skeleton 無法預知該筆資料長怎樣，因此固定假設「資料齊全」的
// 最常見情況（有捷運資訊、有主辦標籤、有容納人數與生咖紀錄），讓 skeleton 高度
// 貼近多數卡片實際高度，而不是每次都用最精簡（最短）的版本去猜——後者反而會讓
// 大部分卡片在資料載入後長高，造成更明顯的 CLS。詳見 design-frontend.md「載入中
// skeleton 容器與實際卡片等寬高」。
export default function VenueCardSkeleton() {
  return (
    <div className={card}>
      <Skeleton height="220px" borderRadius="0" />
      <div className={body}>
        <div className={nameRow}>
          {/* 店名最多 2 行 clamp（見 VenueCard.tsx venueName），40px 對應兩行
              bodySmall 文字的高度，比單行時稍高，跟 body 的 minHeight 一樣是
              抓「最長情境」而非平均情況。 */}
          <Skeleton width="60%" height="40px" borderRadius="4px" />
          <Skeleton width="40px" height="24px" borderRadius="9999px" />
        </div>

        <div className={mrtRow}>
          <Skeleton width="14px" height="14px" borderRadius="9999px" />
          <Skeleton width="120px" height="16px" borderRadius="4px" />
        </div>

        <div className={hostTagsRow}>
          {/* 24px 對應真實 hostTagPill（paddingY 1 + caption 文字），不是 22px */}
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
