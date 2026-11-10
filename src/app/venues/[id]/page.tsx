import { cache } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { venueApi } from '@/lib/api';
import type { Venue } from '@/types';
import { dateToTaipeiDateString } from '@/utils';
import { buildRelatedVenues } from '@/utils/venueRelated';
import { formatTransitStationName, getVenueHeaderTransit } from '@/utils/transitStops';
import { CAPACITY_RANGE_LABEL } from '@/components/venues/venueCapacity';
import VenueDetailV2 from '@/components/venues/detailV2/VenueDetailV2';
import VenueViewTracker from '@/components/venues/VenueViewTracker';

export const revalidate = 86400;

// Empty array: no paths pre-rendered at build time, but this marks the segment
// as SSG-eligible so on-demand visits get cached (runtime ISR) instead of the
// route falling back to fully dynamic/SSR rendering.
export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// Request-scoped memoization: generateMetadata and page body both need this
// data, so cache() ensures the axios call only fires once per request.
const getVenue = cache((id: string) => venueApi.getVenueById(id));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const venue = await getVenue(id);
    const title = `${venue.name} | 場地詳情`;
    const transit = getVenueHeaderTransit(venue);
    const details = [
      transit && `鄰近${formatTransitStationName(transit)}`,
      venue.capacityRange &&
        `可容納${CAPACITY_RANGE_LABEL[venue.capacityRange] ?? venue.capacityRange}`,
    ]
      .filter(Boolean)
      .join('，');
    const description = `${venue.name}是位於${venue.region}的生咖與生日應援場地${details ? `，${details}` : ''}。透過 STELLAR 查看場地照片、聯絡方式${venue.eventCount > 0 ? `，以及已收錄的 ${venue.eventCount} 場生日應援活動紀錄` : ''}。`;
    const url = `https://www.stellar-zone.com/venues/${id}`;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        images: venue.coverPhoto ? [venue.coverPhoto] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: venue.coverPhoto ? [venue.coverPhoto] : [],
      },
      alternates: { canonical: url },
    };
  } catch {
    return { title: '場地詳情' };
  }
}

export default async function VenueDetailPage({ params }: PageProps) {
  const { id } = await params;
  // Fired before awaiting the venue so both requests run in parallel. A failure throws: ISR then
  // keeps serving the last good page instead of caching a tagless one for a day.
  const dictionaryPromise = venueApi.getTagDictionary();
  // Already handled by the await below; this only stops a 404 path from leaving it unhandled
  dictionaryPromise.catch(() => {});

  const venue = await getVenue(id).catch((err) => {
    if (err?.response?.status === 404) return null;
    throw err;
  });
  if (!venue) notFound();

  // ISR renders at most once a day, so "today" (tag expiry, event status) may lag a day
  const today = dateToTaipeiDateString(new Date());

  const [dictionary, allVenues] = await Promise.all([
    dictionaryPromise,
    venueApi
      // The backend defaults to 20 per page for non-random queries, so ask for everything in one go.
      // No sort param: the default composite order is what both strips keep.
      .getVenues({ status: 'active', limit: 1000 })
      .then((r): Venue[] => r.venues)
      // A failed fetch hides both strips instead of failing the page
      .catch((): Venue[] => []),
  ]);
  // Only card fields reach the client component, not the full venue list
  const related = buildRelatedVenues({ venue, allVenues, dictionary, today });

  return (
    <>
      <VenueViewTracker venueId={venue.id} />
      <VenueDetailV2
        venue={venue}
        relatedRegionVenues={related.region}
        relatedTagStrip={related.tag}
        dictionary={dictionary}
        today={today}
      />
    </>
  );
}
