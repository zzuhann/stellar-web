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

// loading.tsx 讀不到 searchParams，故用 client 元件搭配 useSearchParams 判斷是否保留高度；
// 邏輯需與 VenueFilters.tsx:387 的 hasActiveFilters 完全一致，否則會造成 CLS。
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
