'use client';

import { useSearchParams } from 'next/navigation';
import { css } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';

const clearFiltersRow = css({
  display: 'flex',
  justifyContent: 'flex-end',
  paddingX: '4',
  marginTop: '1.5',
});

// 對照 VenueFilters.tsx 的 hasActiveFilters：region/capacity/q 只要有任一個出現
// 在網址上，代表使用者是帶著已套用的篩選進頁面（分享連結、書籤、上一頁返回），
// 真實 filter bar 會多渲染「清除篩選」這一列（約 50px）。loading.tsx 本身讀不到
// searchParams（它不是 page.tsx，Next 不會傳 searchParams 給 loading UI），所以
// 用這個 client 元件搭配 useSearchParams 直接讀網址，決定要不要保留這段高度，
// 避免這種情境下 skeleton 換成真實 filter bar 時多長出一列造成 CLS。
//
// 注意：這邊只判斷「有沒有這個 query key」，不重新驗證合法性——不合法的值會被
// useQueryState 的 parse function 擋掉、視同未設定，但那是之後 client 端的事，
// 這裡只是為了 loading 階段的版面穩定，抓寬鬆一點的判斷即可。
export default function ClearFiltersRowSkeleton() {
  const searchParams = useSearchParams();
  const hasActiveFilters =
    searchParams.has('region') || searchParams.has('capacity') || searchParams.has('q');

  if (!hasActiveFilters) return null;

  return (
    <div className={clearFiltersRow}>
      <Skeleton width="88px" height="44px" borderRadius="6px" />
    </div>
  );
}
