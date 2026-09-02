'use client';

import { useEffect } from 'react';
import { venueApi } from '@/lib/api';

interface VenueViewTrackerProps {
  venueId: string;
}

export default function VenueViewTracker({ venueId }: VenueViewTrackerProps) {
  useEffect(() => {
    const key = `viewed_venue_${venueId}`;
    if (sessionStorage.getItem(key)) return;

    venueApi.recordView(venueId).catch(() => {});
    sessionStorage.setItem(key, '1');
  }, [venueId]);

  return null;
}
