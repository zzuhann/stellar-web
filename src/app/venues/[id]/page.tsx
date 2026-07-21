import { cache } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { venueApi } from '@/lib/api';
import type { Venue } from '@/types';
import { CAPACITY_RANGE_LABEL } from '@/components/venues/venueCapacity';
import VenueDetailClient from './VenueDetailClient';

export const revalidate = 86400;

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
    const details = [
      venue.nearestMrt && `鄰近${venue.nearestMrt.replace(/站$/, '')}站`,
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
  const venue = await getVenue(id).catch((err) => {
    if (err?.response?.status === 404) return null;
    throw err;
  });
  if (!venue) notFound();

  const relatedVenues: Venue[] = venue
    ? await venueApi
        .getVenues({ region: [venue.region], status: 'active' })
        .then((r) => r.venues.filter((v) => v.id !== id))
        .catch(() => [])
    : [];

  return <VenueDetailClient venue={venue} relatedVenues={relatedVenues} />;
}
