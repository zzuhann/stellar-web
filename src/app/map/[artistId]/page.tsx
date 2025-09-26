import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { artistsApi } from '@/lib/api';

const MapPage = dynamic(() => import('@/components/map/MapPage'), {
  ssr: false,
});

interface MapWithArtistPageProps {
  params: {
    artistId: string;
  };
  searchParams?: {
    search?: string;
  };
}

export async function generateMetadata({ params }: MapWithArtistPageProps): Promise<Metadata> {
  try {
    const artist = await artistsApi.getById(params.artistId);

    if (!artist) {
      return {
        title: '藝人不存在',
        description: '在 STELLAR 尋找在你附近的生日應援吧！',
      };
    }

    const title = `${artist.stageName} 生日應援`;
    const description = `在 STELLAR 尋找在你附近的 ${artist.stageName} 生日應援吧！`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: artist.profileImage ? [artist.profileImage] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: artist.profileImage ? [artist.profileImage] : [],
      },
    };
  } catch {
    return {
      title: 'STELLAR | 台灣生日應援地圖',
      description: '在 STELLAR 尋找在你附近的生日應援吧！',
    };
  }
}

export default function MapWithArtistPage({ params, searchParams }: MapWithArtistPageProps) {
  const { artistId } = params;

  // Validate artistId format if needed
  if (!artistId || artistId.trim() === '') {
    notFound();
  }

  return <MapPage artistId={artistId} search={searchParams?.search} />;
}
