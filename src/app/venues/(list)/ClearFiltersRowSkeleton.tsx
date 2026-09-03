'use client';

import { useSearchParams } from 'next/navigation';
import { css } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';
import { parseVenueCapacity } from '@/utils/venues';

const clearFiltersSkeleton = css({
  marginLeft: 'auto',
  flexShrink: 0,
});

// loading.tsx 讀不到 searchParams，故用 client 元件搭配 useSearchParams 判斷是否保留高度；
// 邏輯需與 VenueFilters.tsx 的 hasActiveFilters 完全一致，否則會造成 CLS。
// 渲染在 capacityRow 內、排序 dropdown 之後（與真實的清除篩選按鈕位置一致）。
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
    <Skeleton className={clearFiltersSkeleton} width="88px" height="44px" borderRadius="6px" />
  );
}
