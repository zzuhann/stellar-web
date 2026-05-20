import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Artist } from '@/types';
import { artistsApi } from '@/lib/api';
import MapNewPageClient from '@/components/map-new/MapNewPage';

interface MapNewPageProps {
  params: Promise<{
    artistId: string;
  }>;
}

export async function generateMetadata({ params }: MapNewPageProps): Promise<Metadata> {
  try {
    const { artistId } = await params;
    const artist: Artist | null = await artistsApi.getById(artistId).catch(() => null);

    if (!artist) {
      return {
        title: { absolute: '生咖、生日應援活動地圖 | STELLAR' },
        description:
          '在 STELLAR 尋找台灣各地的生咖（生日應援）活動，透過地圖找到離你最近的活動資訊。',
      };
    }

    const displayName = artist.stageNameZh ?? artist.stageName;
    const title = `${displayName} 生咖、生日應援活動地圖 | STELLAR`;
    const description = `查看 ${displayName} 在台灣各地的生咖（生日應援）活動，透過地圖找到離你最近的活動資訊。`;

    return {
      title: { absolute: title },
      description,
    };
  } catch {
    return {
      title: { absolute: '生咖、生日應援活動地圖 | STELLAR' },
      description:
        '在 STELLAR 尋找台灣各地的生咖（生日應援）活動，透過地圖找到離你最近的活動資訊。',
    };
  }
}

export default async function MapNewPage({ params }: MapNewPageProps) {
  const { artistId } = await params;

  if (!artistId || artistId.trim() === '') {
    notFound();
  }

  return <MapNewPageClient artistId={artistId} />;
}
