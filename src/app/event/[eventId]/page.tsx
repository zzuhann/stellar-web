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

  // 直接在 Server Component 取得資料
  const event = await eventsApi.getById(eventId);

  // 直接傳 event 給 EventDetail
  return <EventDetail event={event} />;
}
