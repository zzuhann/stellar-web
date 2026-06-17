import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { eventsApi } from '@/lib/api';
import EventDetail from '@/components/EventDetail';
import type { CoffeeEvent, FirebaseTimestamp } from '@/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    eventId: string;
  }>;
}

function tsToIso(ts: FirebaseTimestamp): string {
  return new Date(ts._seconds * 1000).toISOString();
}

function buildEventDescription(event: CoffeeEvent): string {
  if (event.description?.trim()) return event.description.trim();

  const artistNames = event.artists.map((a) => a.name).join('、');
  const startDate = new Date(event.datetime.start._seconds * 1000).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return `${artistNames} 生日應援活動，於 ${startDate} 在 ${event.location.name}（${event.location.address}）舉辦。`;
}

function buildEventJsonLd(event: CoffeeEvent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: buildEventDescription(event),
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
    eventStatus: 'https://schema.org/EventScheduled',
    ...(event.mainImage && { image: [event.mainImage] }),
    performer: event.artists.map((a) => ({
      '@type': 'PerformingGroup',
      name: a.name,
    })),
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
