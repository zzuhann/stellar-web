'use client';

import RouteErrorFallback from '@/components/ui/RouteErrorFallback';

interface EventErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function EventError({ error, reset }: EventErrorProps) {
  return (
    <RouteErrorFallback
      title="暫時無法載入這個活動"
      error={error}
      reset={reset}
      routeTag="event-detail"
    />
  );
}
