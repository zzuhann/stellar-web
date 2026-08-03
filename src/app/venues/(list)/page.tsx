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
  // This fetch exists solely to enumerate which regions currently have active venues
  // (for the filter chip list), so it needs a large explicit limit to see everything —
  // it is NOT reused as paginated initialData for the client query below. Reusing it
  // would mean re-deriving pagination.total/totalPages on the frontend from a
  // differently-shaped request, which drifts from the backend the moment either side
  // changes. See design-frontend.md "SSR 地區清單 vs. 分頁的衝突".
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
