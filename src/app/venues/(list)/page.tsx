import { Suspense } from 'react';
import { venueApi } from '@/lib/api';
import { QueryStateProvider } from '@/hooks/useQueryStateContext';
import { deriveVenueRegions } from '@/utils/venues';
import VenuesClient from './VenuesClient';
import VenuesLoading from './loading';

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

export default function VenuesPage() {
  return (
    <Suspense fallback={<VenuesLoading />}>
      <VenuesContent />
    </Suspense>
  );
}

// await 若留在 VenuesPage 本體，Suspense fallback 不會被畫出來，故拆成子元件。
async function VenuesContent() {
  // limit 1000 僅為列舉地區 chip 用，不可重用為下方分頁查詢的 initialData（形狀不同，見 design-frontend.md）。
  const data = await venueApi
    .getVenues({ status: 'active', limit: 1000 })
    .catch(() => ({ venues: [] }));
  const regions = deriveVenueRegions(data.venues ?? []);

  return (
    <QueryStateProvider>
      <VenuesClient regions={regions} />
    </QueryStateProvider>
  );
}
