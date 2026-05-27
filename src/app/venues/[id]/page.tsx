import { Metadata } from 'next';
import { venueApi } from '@/lib/api';
import type { Venue } from '@/types';
import VenueDetailClient from './VenueDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const venue = await venueApi.getVenueById(id);
    const title = `${venue.name} | 場地`;
    const description =
      venue.description ||
      `${venue.name}，位於 ${venue.region}。辦過 ${venue.eventCount} 場生咖活動。`;
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
    return { title: '場地詳情 | STELLAR' };
  }
}

export default async function VenueDetailPage({ params }: PageProps) {
  const { id } = await params;
  const venue = await venueApi.getVenueById(id).catch(() => null);

  const relatedVenues: Venue[] = venue
    ? await venueApi
        .getVenues({ region: [venue.region], status: 'active' })
        .then((r) => r.venues.filter((v) => v.id !== id))
        .catch(() => [])
    : [];

  return <VenueDetailClient venue={venue} relatedVenues={relatedVenues} />;
}
