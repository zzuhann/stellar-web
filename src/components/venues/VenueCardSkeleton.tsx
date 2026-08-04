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
  paddingTop: '3',
  paddingX: '3',
  paddingBottom: '3',
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
          <Skeleton width="60%" height="28px" borderRadius="4px" />
          <Skeleton width="40px" height="24px" borderRadius="9999px" />
        </div>

        <div className={mrtRow}>
          <Skeleton width="14px" height="14px" borderRadius="9999px" />
          <Skeleton width="120px" height="16px" borderRadius="4px" />
        </div>

        <div className={hostTagsRow}>
          <Skeleton width="56px" height="22px" borderRadius="9999px" />
          <Skeleton width="64px" height="22px" borderRadius="9999px" />
          <Skeleton width="48px" height="22px" borderRadius="9999px" />
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
