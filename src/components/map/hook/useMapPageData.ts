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

  // 先解析 artist（支援 slug 或 ID），拿到 Firestore ID 後再查地圖資料
  const { data: artistData, isLoading: isArtistLoading } = useArtist(artistId);
  const resolvedArtistId = artistData?.id;

  const { data: mapData, isLoading: isMapLoading } = useMapData({
    status: 'all',
    search,
    artistId: resolvedArtistId,
    // 若有指定藝人，等 artist 解析完才送出查詢，確保用的是 Firestore ID
    enabled: artistId ? !!resolvedArtistId : true,
  });

  const mapEvents = mapData?.events || [];

  return {
    mapEvents,
    isMapLoading,
    artistData,
    isArtistLoading,
  };
};

export default useMapPageData;
