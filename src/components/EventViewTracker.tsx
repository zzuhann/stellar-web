'use client';

import { useEffect } from 'react';
import { eventsApi } from '@/lib/api';

interface EventViewTrackerProps {
  eventId: string;
}

export default function EventViewTracker({ eventId }: EventViewTrackerProps) {
  useEffect(() => {
    const key = `viewed_event_${eventId}`;
    if (sessionStorage.getItem(key)) return;

    eventsApi.recordView(eventId).catch(() => {});
    sessionStorage.setItem(key, '1');
  }, [eventId]);

  return null;
}
