import { Suspense } from 'react';
import { venueApi } from '@/lib/api';
import { QueryStateProvider } from '@/hooks/useQueryStateContext';
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
  const data = await venueApi.getVenues({ status: 'active' });
  const venues = data.venues ?? [];

  return (
    <Suspense>
      <QueryStateProvider>
        <VenuesClient initialVenues={venues} />
      </QueryStateProvider>
    </Suspense>
  );
}
