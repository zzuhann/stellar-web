import { redirect } from 'next/navigation';
import MapClientWrapper from './[artistId]/MapClientWrapper';

interface MapPageRouteProps {
  searchParams: Promise<{
    artistId?: string;
    search?: string;
  }>;
}

export default async function MapPageRoute({ searchParams }: MapPageRouteProps) {
  const { artistId } = await searchParams;
  // 如果沒有 artistId 參數，重導向到首頁
  if (!artistId) {
    redirect('/');
  }

  return <MapClientWrapper artistId={artistId} />;
}
