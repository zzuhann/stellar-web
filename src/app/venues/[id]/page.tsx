import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { venueApi } from '@/lib/api';
import type { Venue } from '@/types';
import VenueDetailClient from './VenueDetailClient';

export const revalidate = 86400;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const venue = await venueApi.getVenueById(id);
    const title = `${venue.name} | 場地詳情`;
    const description = `適合辦生咖、生日應援的場地：位於${venue.region}的${venue.name}，平台已收錄${venue.eventCount}場生咖、生日應援活動。`;
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
  const venue = await venueApi.getVenueById(id).catch((err) => {
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
