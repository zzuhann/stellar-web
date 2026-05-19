import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { eventsApi } from '@/lib/api';
import EventDetail from '@/components/EventDetail';
import type { CoffeeEvent, FirebaseTimestamp } from '@/types';

interface PageProps {
  params: Promise<{
    eventId: string;
  }>;
}

function tsToIso(ts: FirebaseTimestamp): string {
  return new Date(ts._seconds * 1000).toISOString();
}

function buildEventJsonLd(event: CoffeeEvent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: tsToIso(event.datetime.start),
    endDate: tsToIso(event.datetime.end),
    location: {
      '@type': 'Place',
      name: event.location.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.location.address,
        addressCountry: 'TW',
      },
    },
    ...(event.mainImage && { image: [event.mainImage] }),
    url: `https://www.stellar-zone.com/event/${event.slug ?? event.id}`,
    organizer: {
      '@type': 'Organization',
      name: 'STELLAR',
      url: 'https://www.stellar-zone.com',
    },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventId } = await params;
  try {
    const event = await eventsApi.getById(eventId);
    const eventTitle = event?.title;
    const artistName = event?.artists?.[0]?.name;
    const title = artistName ? `${eventTitle} | ${artistName} 生咖、生日應援活動` : eventTitle;
    const description = event?.description;
    return {
      title,
      description,
      alternates: {
        canonical: `https://www.stellar-zone.com/event/${event?.slug ?? eventId}`,
      },
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

  return (
    <>
      {event && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildEventJsonLd(event)) }}
        />
      )}
      <EventDetail event={event} />
    </>
  );
}
