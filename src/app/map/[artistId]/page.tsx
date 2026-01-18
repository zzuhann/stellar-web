import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { artistsApi } from '@/lib/api';
import MapClientWrapper from './MapClientWrapper';

interface MapWithArtistPageProps {
  params: Promise<{
    artistId: string;
  }>;
  searchParams: Promise<{
    search?: string;
  }>;
}

export async function generateMetadata({ params }: MapWithArtistPageProps): Promise<Metadata> {
  try {
    const { artistId } = await params;
    const artist = await artistsApi.getById(artistId);

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

export default async function MapWithArtistPage({ params, searchParams }: MapWithArtistPageProps) {
  const { artistId } = await params;
  const { search } = await searchParams;

  // Validate artistId format if needed
  if (!artistId || artistId.trim() === '') {
    notFound();
  }

  return <MapClientWrapper artistId={artistId} search={search} />;
}
