import { Suspense } from 'react';
import { css } from '@/styled-system/css';
import VenueCardSkeleton from '@/components/venues/VenueCardSkeleton';
import Skeleton from '@/components/ui/Skeleton';
import ClearFiltersRowSkeleton from './ClearFiltersRowSkeleton';
import {
  COUNT_ROW_HEIGHT,
  cardGrid,
  countRow,
  heroSection,
  inner,
  listSection,
  page,
  subtitle,
  title,
} from './venueListLayout';

// top/毛玻璃需與 VenueFilters.tsx 的 filterBar 一致，避免真實內容換入時版面跳動。
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
  display: 'flex',
  flexDirection: 'column',
  '@media (min-width: 768px)': {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: '4',
    rowGap: '2.5',
    paddingX: '6',
  },
});

// Same flex/order rules as VenueFilters.tsx; keep the two in sync
const searchRow = css({
  paddingX: '4',
  marginBottom: '2.5',
  order: 1,
  '@media (min-width: 768px)': {
    flex: '1 1 200px',
    maxWidth: '360px',
    paddingX: '0',
    marginBottom: '0',
  },
});

// 對應真實 VenueFilters.tsx 的 regionWrap（外層相對定位容器，裡面包可捲動的
// regionRow）。骨架不需要真的做出滾動/漸層遮罩互動邏輯，但保留同一層外層包裝，
// 讓兩者的 DOM 結構深度一致。
const regionWrap = css({
  position: 'relative',
  order: 2,
  '@media (min-width: 768px)': { order: 3, flexBasis: '100%' },
});

const regionRow = css({
  display: 'flex',
  gap: '1.5',
  overflow: 'hidden',
  paddingX: '4',
  '@media (min-width: 768px)': { flexWrap: 'wrap', paddingX: '0' },
});

const capacityRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  paddingX: '4',
  marginTop: '2.5',
  order: 3,
  '@media (min-width: 768px)': { order: 2, paddingX: '0', marginTop: '0', marginLeft: 'auto' },
});

// 對齊真實 filterDivider（VenueFilters.tsx）：不設固定 height，改用 alignSelf:
// 'stretch' 撐滿所在 flex row（capacityRow 裡由 44px 高的 dropdownTrigger 決定）。
const filterDivider = css({
  width: '1px',
  alignSelf: 'stretch',
  background: 'color.border.light',
  flexShrink: 0,
  marginX: '1',
});

export default function VenuesLoading() {
  return (
    <main id="main-content" className={page}>
      <div className={inner}>
        <section className={heroSection}>
          <h1 className={title}>生咖、生日應援場地列表</h1>
          <p className={subtitle}>在 STELLAR 找到適合舉辦生咖、生日應援的空間！</p>
        </section>

        <div className={filterBar}>
          <div className={searchRow}>
            <Skeleton width="100%" height="44px" borderRadius="8px" />
          </div>

          {/* 容納人數/排序 trigger 骨架寬高需與 VenueFilters.tsx 的 dropdownTrigger（108x44）一致；
              清除篩選 icon 已併入這一列尾端（見 VenueFilters.tsx capacityRow），骨架比照併入，
              不再是獨立一行，交給 ClearFiltersRowSkeleton 用 useSearchParams 判斷是否 render。 */}
          <div className={capacityRow}>
            <Skeleton width="108px" height="44px" borderRadius="6px" />
            <div className={filterDivider} aria-hidden="true" />
            <Skeleton width="108px" height="44px" borderRadius="6px" />
            <Suspense fallback={null}>
              <ClearFiltersRowSkeleton />
            </Suspense>
          </div>
          {/* regionChip 已於 90bb837 補上 44px 觸控高度（原本只靠 paddingY），骨架同步更新，
              否則載入態換入真實內容時區域列高度會跳動。regionWrap 外層包裝對應真實
              VenueFilters.tsx 的 regionWrap + regionFadeLeft/Right 結構層級（骨架不需要
              漸層遮罩本身，只需要結構對得上，不會造成 CLS，純粹是視覺結構一致性）。 */}
          <div className={regionWrap}>
            <div className={regionRow}>
              <Skeleton width="48px" height="44px" borderRadius="9999px" />
              <Skeleton width="64px" height="44px" borderRadius="9999px" />
              <Skeleton width="56px" height="44px" borderRadius="9999px" />
              <Skeleton width="72px" height="44px" borderRadius="9999px" />
            </div>
          </div>
        </div>

        <div className={countRow} aria-hidden="true">
          <Skeleton width="120px" height={COUNT_ROW_HEIGHT} />
        </div>

        <section className={listSection}>
          <div className={cardGrid}>
            {Array.from({ length: 6 }, (_, i) => (
              <VenueCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
