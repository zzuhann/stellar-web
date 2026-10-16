import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { venueApi } from '@/lib/api';
import type { Venue } from '@/types';
import { dateToTaipeiDateString } from '@/utils';
import VenueDetailV2 from '@/components/venues/detailV2/VenueDetailV2';

// Store owners must see re-imported tags on refresh, so no ISR and no static params
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

const getVenue = cache((id: string) => venueApi.getVenueById(id));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const base: Metadata = {
    robots: { index: false, follow: false },
    alternates: { canonical: `https://www.stellar-zone.com/venues/${id}` },
  };
  try {
    const venue = await getVenue(id);
    return { ...base, title: `${venue.name} | 新版場地頁預覽` };
  } catch {
    return { ...base, title: '新版場地頁預覽' };
  }
}

export default async function VenuePreviewPage({ params }: PageProps) {
  const { id } = await params;
  // Fired before awaiting the venue so both requests run in parallel; failure only hides tags
  const dictionaryPromise = venueApi.getTagDictionary().catch(() => null);

  const venue = await getVenue(id).catch((err) => {
    if (err?.response?.status === 404) return null;
    throw err;
  });
  if (!venue) notFound();

  const [dictionary, relatedVenues] = await Promise.all([
    dictionaryPromise,
    venueApi
      .getVenues({ region: [venue.region], status: 'active', limit: 1000 })
      .then((r): Venue[] => r.venues.filter((v) => v.id !== id))
      .catch((): Venue[] => []),
  ]);

  return (
    <VenueDetailV2
      venue={venue}
      relatedVenues={relatedVenues}
      dictionary={dictionary}
      today={dateToTaipeiDateString(new Date())}
      analyticsEnabled={false}
    />
  );
}
