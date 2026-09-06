'use client';

import { useSearchParams } from 'next/navigation';
import Skeleton from '@/components/ui/Skeleton';
import { parseVenueCapacity } from '@/utils/venues';

// loading.tsx 讀不到 searchParams，故用 client 元件搭配 useSearchParams 判斷是否保留高度；
// 邏輯需與 VenueFilters.tsx 的 hasActiveFilters 完全一致，否則會造成 CLS。
//
// 清除篩選按鈕已改為 icon-only、併入 capacityRow 尾端（不再是獨立一整行，見
// VenueFilters.tsx 的 clearFiltersIconButton），這裡直接 render 成該列的最後一個
// flex item，用 marginLeft: auto 頂到最右側，尺寸對齊 44x44 觸控目標。
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

  return <Skeleton width="44px" height="44px" borderRadius="6px" style={{ marginLeft: 'auto' }} />;
}
