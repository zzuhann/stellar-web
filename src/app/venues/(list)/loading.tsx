import { Suspense } from 'react';
import { css } from '@/styled-system/css';
import VenueCardSkeleton from '@/components/venues/VenueCardSkeleton';
import Skeleton from '@/components/ui/Skeleton';
import ClearFiltersRowSkeleton from './ClearFiltersRowSkeleton';

const page = css({
  minHeight: '100vh',
  background: 'color.background.primary',
  paddingTop: '70px',
});

const inner = css({
  maxWidth: '500px',
  margin: '0 auto',
  boxShadow: 'shadow.md',
});

const heroSection = css({
  paddingTop: '4',
  paddingX: '4',
  paddingBottom: '3',
  background: 'color.background.primary',
});

const title = css({
  marginTop: '0.5',
  marginX: '0',
  marginBottom: '1.5',
  textStyle: 'h3',
  fontWeight: 'bold',
  color: 'color.text.primary',
});

const subtitle = css({
  margin: 0,
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

// 對照 VenueFilters.tsx 的 filterBar：position sticky + top 70px（緊接在固定
// header 下方）、同樣的毛玻璃背景，避免 skeleton 換成真正 filter bar 時整段
// 版面往上跳。
const filterBar = css({
  position: 'sticky',
  top: '70px',
  zIndex: 20,
  background: 'alpha.white.90',
  backdropFilter: 'saturate(180%) blur(10px)',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  paddingTop: '2.5',
  paddingBottom: '3',
});

const searchRow = css({
  paddingX: '4',
  marginBottom: '2.5',
});

const regionRow = css({
  display: 'flex',
  gap: '1.5',
  overflow: 'hidden',
  paddingX: '4',
});

const capacityRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  paddingX: '4',
  marginTop: '2.5',
});

const filterDivider = css({
  width: '1px',
  height: '24px',
  background: 'color.border.light',
  flexShrink: 0,
  marginX: '1',
});

const listSection = css({
  padding: '4',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

export default function VenuesLoading() {
  return (
    <div className={page}>
      <div className={inner}>
        <section className={heroSection}>
          <h1 className={title}>生咖、生日應援場地列表</h1>
          <p className={subtitle}>在 STELLAR 找到適合舉辦生咖、生日應援的空間！</p>
        </section>

        {/* 對照 VenueFilters 的 4 個區塊：搜尋列／地區 chips／容納人數+排序／
            清除篩選（條件渲染）。清除篩選列是否要保留高度，交給
            ClearFiltersRowSkeleton 用 useSearchParams 判斷——首次進入頁面
            （無 query params）不會顯示，但帶著 ?region=... 等篩選進頁面時會，
            兩種情況都要跟真實 VenueFilters 的 hasActiveFilters 行為一致，
            否則其中一種情境仍會在 skeleton 換成真實內容時造成 CLS。 */}
        <div className={filterBar}>
          <div className={searchRow}>
            <Skeleton width="100%" height="44px" borderRadius="8px" />
          </div>

          <div className={regionRow}>
            <Skeleton width="48px" height="36px" borderRadius="9999px" />
            <Skeleton width="64px" height="36px" borderRadius="9999px" />
            <Skeleton width="56px" height="36px" borderRadius="9999px" />
            <Skeleton width="72px" height="36px" borderRadius="9999px" />
          </div>

          <div className={capacityRow}>
            <Skeleton width="56px" height="16px" borderRadius="4px" />
            <Skeleton width="90px" height="36px" borderRadius="6px" />
            <div className={filterDivider} aria-hidden="true" />
            <Skeleton width="150px" height="44px" borderRadius="6px" />
          </div>

          <Suspense fallback={null}>
            <ClearFiltersRowSkeleton />
          </Suspense>
        </div>

        <section className={listSection}>
          {Array.from({ length: 6 }, (_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </section>
      </div>
    </div>
  );
}
