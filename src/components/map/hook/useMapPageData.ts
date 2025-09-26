import { useArtist } from '@/hooks/useArtist';
import { useMapData } from '@/hooks/useMapData';
import { useSearchParams } from 'next/navigation';

type UseMapPageDataProps = {
  propsSearch?: string;
  propsArtistId?: string;
};

const useMapPageData = ({ propsSearch, propsArtistId }: UseMapPageDataProps) => {
  const searchParams = useSearchParams();
  const search = propsSearch || searchParams?.get('search') || '';
  const artistId = propsArtistId || searchParams?.get('artistId') || '';

  const { data: mapData, isLoading: isMapLoading } = useMapData({
    status: 'all',
    search,
    artistId,
  });

  const mapEvents = mapData?.events || [];

  const { data: artistData, isLoading: isArtistLoading } = useArtist(artistId);

  return {
    mapEvents,
    isMapLoading,
    artistData,
    isArtistLoading,
  };
};

export default useMapPageData;
