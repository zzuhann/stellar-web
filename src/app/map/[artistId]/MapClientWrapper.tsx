'use client';

import dynamic from 'next/dynamic';

const MapPage = dynamic(() => import('@/components/map/MapPage'), {
  ssr: false,
});

interface MapClientWrapperProps {
  artistId: string;
  search?: string;
}

export default function MapClientWrapper({ artistId, search }: MapClientWrapperProps) {
  return <MapPage artistId={artistId} search={search} />;
}
