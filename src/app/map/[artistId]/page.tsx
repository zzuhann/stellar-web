import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { Artist } from '@/types';
import { artistsApi, eventsApi } from '@/lib/api';
import MapPageClient from '@/components/map/MapPage';

export const revalidate = 3600; // ISR: 1 hour

interface MapPageProps {
  params: Promise<{
    artistId: string;
  }>;
}

export async function generateMetadata({ params }: MapPageProps): Promise<Metadata> {
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
    const resolvedArtistId = artist.slug ?? artistId;
    const ogImageUrl = `https://www.stellar-zone.com/map/${resolvedArtistId}/opengraph-image`;
    const canonicalUrl = `https://www.stellar-zone.com/map/${resolvedArtistId}`;

    return {
      title: { absolute: title },
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${displayName} 生咖、生日應援活動地圖`,
          },
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
      title: { absolute: '生咖、生日應援活動地圖 | STELLAR' },
      description:
        '在 STELLAR 尋找台灣各地的生咖（生日應援）活動，透過地圖找到離你最近的活動資訊。',
    };
  }
}

export default async function MapPage({ params }: MapPageProps) {
  const { artistId } = await params;

  if (!artistId || artistId.trim() === '') {
    notFound();
  }

  const artist = await artistsApi.getById(artistId).catch((err) => {
    if (err?.response?.status === 404) return null;
    throw err;
  });

  if (artist?.slug && artistId !== artist.slug) {
    permanentRedirect(`/map/${artist.slug}`);
  }

  const queryClient = new QueryClient();

  if (artist) {
    // Seed artist cache so useArtist() on the client is a cache hit
    queryClient.setQueryData(['artist', artistId], artist);

    // Prefetch events in parallel with SSR — eliminates the client-side waterfall
    // (artist fetch → resolve Firestore ID → events fetch)
    await queryClient.prefetchQuery({
      queryKey: ['map-data', { status: 'all', search: '', artistId: artist.id }],
      queryFn: () => eventsApi.getMapData({ status: 'all', artistId: artist.id }),
      staleTime: 1000 * 60 * 5,
    });
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://www.stellar-zone.com/' },
      {
        '@type': 'ListItem',
        position: 2,
        name: artist
          ? `${artist.stageNameZh ?? artist.stageName} 生咖、生日應援活動地圖`
          : '生日應援地圖',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MapPageClient artistId={artistId} />
      </HydrationBoundary>
    </>
  );
}
