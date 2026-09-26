import { useArtist } from '@/hooks/useArtist';
import { useMapData } from '@/hooks/useMapData';

type UseMapPageDataProps = {
  artistId: string;
};

const useMapPageData = ({ artistId }: UseMapPageDataProps) => {
  const search = '';

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
