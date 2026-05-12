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

export async function generateMetadata({ params }: MapWithArtistPageProps): Promise<Metadata> {
  try {
    const { artistId } = await params;
    const artist: Artist | null = await artistsApi.getById(artistId).catch(() => null);

    if (!artist) {
      return {
        title: '藝人不存在',
        description: '在 STELLAR 尋找在你附近的生日應援吧！',
      };
    }

    const title = `${artist.stageName} 生日應援`;
    const description = `在 STELLAR 尋找在你附近的 ${artist.stageName} 生日應援吧！`;
    const resolvedArtistId = artist.slug ?? artistId;
    const ogImageUrl = `https://www.stellar-zone.com/map/${resolvedArtistId}/opengraph-image`;

    return {
      title,
      description,
      alternates: {
        canonical: `https://www.stellar-zone.com/map/${resolvedArtistId}`,
      },
      openGraph: {
        title,
        description,
        images: [
          { url: ogImageUrl, width: 1200, height: 630, alt: `${artist.stageName} 生日應援` },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
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
