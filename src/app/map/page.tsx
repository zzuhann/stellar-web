import dynamicImport from 'next/dynamic';
import { redirect } from 'next/navigation';

const MapPage = dynamicImport(() => import('@/components/map/MapPage'), {
  ssr: false,
});

interface MapPageRouteProps {
  searchParams?: {
    artistId?: string;
    search?: string;
  };
}

export default function MapPageRoute({ searchParams }: MapPageRouteProps) {
  // 如果沒有 artistId 參數，重導向到首頁
  if (!searchParams?.artistId) {
    redirect('/');
  }

  return <MapPage artistId={searchParams.artistId} search={searchParams.search} />;
}
