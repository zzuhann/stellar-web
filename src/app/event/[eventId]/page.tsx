import { Metadata } from 'next';
import { eventsApi } from '@/lib/api';
import EventDetailClient from './EventDetailClient';

interface PageProps {
  params: {
    eventId: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const event = await eventsApi.getById(params.eventId);

    if (!event) {
      return {
        title: '生咖不存在',
        description: '',
      };
    }

    const title = event.title;

    return {
      title,
      description: event.description || '',
      openGraph: {
        title,
        description: event.description || '',
        images: event.mainImage ? [event.mainImage] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: event.description || '',
        images: event.mainImage ? [event.mainImage] : [],
      },
    };
  } catch {
    return {
      title: '生咖詳情',
      description: '',
    };
  }
}

export default function EventDetailPage({ params }: PageProps) {
  return <EventDetailClient eventId={params.eventId} />;
}
