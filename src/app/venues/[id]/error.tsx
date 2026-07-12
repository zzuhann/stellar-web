'use client';

import RouteErrorFallback from '@/components/ui/RouteErrorFallback';

interface VenueErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function VenueError({ error, reset }: VenueErrorProps) {
  return (
    <RouteErrorFallback
      title="暫時無法載入場地資訊"
      error={error}
      reset={reset}
      routeTag="venue-detail"
    />
  );
}
