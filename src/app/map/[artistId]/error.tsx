'use client';

import RouteErrorFallback from '@/components/ui/RouteErrorFallback';

interface MapErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MapError({ error, reset }: MapErrorProps) {
  return <RouteErrorFallback title="暫時無法載入地圖" error={error} reset={reset} routeTag="map" />;
}
