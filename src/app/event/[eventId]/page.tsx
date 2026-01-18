import { Metadata } from 'next';
import { eventsApi } from '@/lib/api';
import EventDetail from '@/components/EventDetail';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

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

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getById(eventId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EventDetail eventId={eventId} />
    </HydrationBoundary>
  );
}
