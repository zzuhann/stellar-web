import { Suspense } from 'react';
import { venueApi } from '@/lib/api';
import { QueryStateProvider } from '@/hooks/useQueryStateContext';
import { deriveVenueRegions } from '@/utils/venues';
import VenuesClient from './VenuesClient';

export const revalidate = 86400;

export const metadata = {
  title: '生咖、生日應援場地列表',
  description: '在 STELLAR 找到適合舉辦生咖、生日應援的空間！',
  openGraph: {
    title: '生咖、生日應援場地列表',
    description: '在 STELLAR 找到適合舉辦生咖、生日應援的空間！',
    url: 'https://www.stellar-zone.com/venues',
  },
  alternates: {
    canonical: 'https://www.stellar-zone.com/venues',
  },
};

export default async function VenuesPage() {
  // 這支 fetch 唯一目的是列舉目前有場地的地區（給地區 chip 用），所以要帶大 limit
  // 一次拿到全部——不會拿來當下方 client 端分頁查詢的 initialData。若重用它，等於要
  // 在前端根據一個形狀不同的請求反推 pagination.total/totalPages，兩邊邏輯遲早會對不上。
  // 詳見 design-frontend.md「SSR 地區清單 vs. 分頁的衝突」。
  const data = await venueApi
    .getVenues({ status: 'active', limit: 1000 })
    .catch(() => ({ venues: [] }));
  const regions = deriveVenueRegions(data.venues ?? []);

  return (
    <Suspense>
      <QueryStateProvider>
        <VenuesClient regions={regions} />
      </QueryStateProvider>
    </Suspense>
  );
}
