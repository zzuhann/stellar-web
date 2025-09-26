'use client';

import EventDetail from '@/components/EventDetail';

interface EventDetailClientProps {
  eventId: string;
}

export default function EventDetailClient({ eventId }: EventDetailClientProps) {
  return <EventDetail eventId={eventId} />;
}
