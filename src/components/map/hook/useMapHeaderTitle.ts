import { useEffect } from 'react';
import { useHeaderTitleStore } from '@/store/useHeaderTitleStore';
import { buildMapHeaderTitle, MAP_HEADER_TITLE } from '../utils/buildMapHeaderTitle';

interface ArtistNames {
  stageName?: string | null;
  stageNameZh?: string | null;
}

// Feeds the artist name into the global Header; clears on unmount so other pages don't show a stale title
export default function useMapHeaderTitle(artist: ArtistNames | undefined) {
  const setHeaderTitle = useHeaderTitleStore((state) => state.setTitle);
  const eyebrow = buildMapHeaderTitle(artist?.stageName, artist?.stageNameZh);

  useEffect(() => {
    if (!eyebrow) return;
    setHeaderTitle(MAP_HEADER_TITLE, eyebrow);
    return () => setHeaderTitle(null);
  }, [eyebrow, setHeaderTitle]);
}
