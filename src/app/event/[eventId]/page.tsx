import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { eventsApi } from '@/lib/api';
import EventDetail from '@/components/EventDetail';

interface PageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  try {
    const event = await eventsApi.getById(eventId);
    const title = event?.title;
    const description = event?.description;
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: event?.mainImage ? [event.mainImage] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: event?.mainImage ? [event.mainImage] : [],
      },
    };
  } catch {
    return {
      title: '生日應援詳情',
      description: '',
    };
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { eventId } = await params;

  if (!eventId || eventId.trim() === '') {
    notFound();
  }

  const event = await eventsApi.getById(eventId).catch(() => null);

  if (event?.slug && eventId !== event.slug) {
    permanentRedirect(`/event/${event.slug}`);
  }

  return <EventDetail event={event} />;
}
