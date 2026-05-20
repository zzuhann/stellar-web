'use client';

import dynamic from 'next/dynamic';

// MapNewPage uses Leaflet which requires client-side only rendering
const MapNewPage = dynamic(() => import('@/components/map-new/MapNewPage'), {
  ssr: false,
});

interface MapNewClientProps {
  artistId: string;
}

export default function MapNewClient({ artistId }: MapNewClientProps) {
  return <MapNewPage artistId={artistId} />;
}
