import { venueApi } from '@/lib/api';
import VenuesClient from './VenuesClient';

export const metadata = {
  title: '場地索引 | STELLAR',
  description: '找適合舉辦生咖、生日應援的咖啡廳、酒吧、書店、展演空間。',
};

export default async function VenuesPage() {
  const data = await venueApi.getVenues({ status: 'active' }).catch(() => ({ venues: [] }));
  const venues = data.venues ?? [];

  return <VenuesClient initialVenues={venues} totalCount={venues.length} />;
}
