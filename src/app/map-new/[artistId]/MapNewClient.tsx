'use client';
import MapNewPage from '@/components/map-new/MapNewPage';

interface MapNewClientProps {
  artistId: string;
}

export default function MapNewClient({ artistId }: MapNewClientProps) {
  return <MapNewPage artistId={artistId} />;
}
