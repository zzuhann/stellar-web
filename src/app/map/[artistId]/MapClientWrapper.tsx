'use client';

import dynamic from 'next/dynamic';
import { usePageView } from '@/hooks/usePageView';

const MapPage = dynamic(() => import('@/components/map/MapPage'), {
  ssr: false,
});

interface MapClientWrapperProps {
  artistId: string;
  search?: string;
}

export default function MapClientWrapper({ artistId, search }: MapClientWrapperProps) {
  usePageView({ eventPage: '/map/[artistId]', contentId: artistId });

  return <MapPage artistId={artistId} search={search} />;
}
