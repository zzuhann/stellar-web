'use client';

import RouteErrorFallback from '@/components/ui/RouteErrorFallback';

interface VenuePreviewErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function VenuePreviewError({ error, reset }: VenuePreviewErrorProps) {
  return (
    <RouteErrorFallback
      title="暫時無法載入場地資訊"
      error={error}
      reset={reset}
      routeTag="venue-preview"
    />
  );
}
