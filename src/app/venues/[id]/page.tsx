import { Metadata } from 'next';
import { venueApi } from '@/lib/api';
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
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: venue.coverPhoto ? [venue.coverPhoto] : [],
      },
    };
  } catch {
    return { title: '場地詳情 | STELLAR' };
  }
}

export default async function VenueDetailPage({ params }: PageProps) {
  const { id } = await params;
  const venue = await venueApi.getVenueById(id).catch(() => null);

  return <VenueDetailClient venue={venue} />;
}
