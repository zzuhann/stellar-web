'use client';

import { useSearchParams } from 'next/navigation';
import { css } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';
import { parseVenueCapacity } from '@/utils/venues';

const clearFiltersRow = css({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingX: '4',
  marginTop: '1.5',
});

// 對照 VenueFilters.tsx:387 的 hasActiveFilters（region !== '全部' || capacity !==
// 'all' || searchInput !== ''）：真實 filter bar 只在某個 filter 是「合法且非預設值」
// 時才多渲染「清除篩選」這一列（約 50px）。loading.tsx 本身讀不到 searchParams（它不是
// page.tsx，Next 不會傳 searchParams 給 loading UI），所以用這個 client 元件搭配
// useSearchParams 直接讀網址，決定要不要保留這段高度。
//
// 修正前的 bug：只判斷「有沒有這個 query key」，導致 ?region=全部、?capacity=all、
// ?q=（空字串）這類「key 存在但仍是預設值」的網址，skeleton 誤判為有 active filter，
// 多保留一列高度，但真實 VenueFilters 渲染後並不會顯示這顆按鈕，造成 CLS。
//
// region 沒有對應的白名單 parse function（VenuesClient.tsx 對 region 用的是 identity
// parse，沒有驗證合法性），所以這裡直接比對 '全部'，跟正式的 hasActiveFilters 邏輯一致；
// capacity 借用 parseVenueCapacity 做跟正式流程相同的白名單驗證與 fallback。
// q 不 trim，跟 VenueFilters.tsx:387 的 hasActiveFilters 完全一致，避免 ?q=%20
// 這種純空白搜尋字串被誤判為「沒有 active filter」。
export default function ClearFiltersRowSkeleton() {
  const searchParams = useSearchParams();

  const region = searchParams.get('region');
  const capacity = searchParams.get('capacity');
  const q = searchParams.get('q');

  const hasActiveFilters =
    (region !== null && region !== '全部') ||
    (capacity !== null && parseVenueCapacity(capacity) !== 'all') ||
    (q !== null && q !== '');

  if (!hasActiveFilters) return null;

  return (
    <div className={clearFiltersRow}>
      <Skeleton width="88px" height="44px" borderRadius="6px" />
    </div>
  );
}
