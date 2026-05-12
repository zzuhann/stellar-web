import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { Artist } from '@/types';
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

async function fetchArtistForMetadata(artistId: string): Promise<Artist | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/artists/${artistId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<Artist>;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: MapWithArtistPageProps): Promise<Metadata> {
  try {
    const { artistId } = await params;
    const artist = await fetchArtistForMetadata(artistId);

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
      alternates: {
        canonical: `https://www.stellar-zone.com/map/${artist.slug ?? artistId}`,
      },
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

  if (!artistId || artistId.trim() === '') {
    notFound();
  }

  const artist = await artistsApi.getById(artistId).catch(() => null);

  if (artist?.slug && artistId !== artist.slug) {
    permanentRedirect(`/map/${artist.slug}`);
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://www.stellar-zone.com/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: artist ? `${artist.stageName} 生日應援地圖` : '生日應援地圖',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MapClientWrapper artistId={artistId} search={search} />
    </>
  );
}
