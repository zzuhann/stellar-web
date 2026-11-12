import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { Artist } from '@/types';
import { artistsApi, eventsApi } from '@/lib/api';
import queryKey from '@/hooks/queryKey';
import MapOverview from '@/components/map/overview/MapOverview';

export const revalidate = 86400; // ISR: 24 hours

// Empty array: marks the segment SSG-eligible so on-demand visits get cached (runtime ISR)
// instead of falling back to fully dynamic rendering.
export async function generateStaticParams() {
  return [];
}

interface MapOverviewPageProps {
  params: Promise<{
    artistId: string;
  }>;
}

const SITE_URL = 'https://www.stellar-zone.com';
const FALLBACK_TITLE = '生咖總覽 | STELLAR';
const FALLBACK_DESCRIPTION = '在 STELLAR 一頁看完藝人在台灣各地的生咖（生日應援）活動。';

export async function generateMetadata({ params }: MapOverviewPageProps): Promise<Metadata> {
  try {
    const { artistId } = await params;
    const artist: Artist | null = await artistsApi.getById(artistId).catch(() => null);

    if (!artist) {
      return { title: { absolute: FALLBACK_TITLE }, description: FALLBACK_DESCRIPTION };
    }

    const displayName = artist.stageNameZh ?? artist.stageName;
    const title = `${displayName} 生咖總覽 | STELLAR`;
    const description = `一頁看完 ${displayName} 在台灣各地的生咖（生日應援）活動，截圖分享給朋友一起討論。`;
    const resolvedArtistId = artist.slug ?? artistId;
    // Must differ from the map page canonical, or the two pages are treated as duplicates
    const canonicalUrl = `${SITE_URL}/map/${resolvedArtistId}/overview`;
    // Reuses the map page og image; this route has no opengraph-image of its own
    const ogImageUrl = `${SITE_URL}/map/${resolvedArtistId}/opengraph-image`;

    return {
      title: { absolute: title },
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${displayName} 生咖總覽`,
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
    return { title: { absolute: FALLBACK_TITLE }, description: FALLBACK_DESCRIPTION };
  }
}

export default async function MapOverviewPage({ params }: MapOverviewPageProps) {
  const { artistId } = await params;

  if (!artistId || artistId.trim() === '') {
    notFound();
  }

  const artist = await artistsApi.getById(artistId).catch((err) => {
    if (err?.response?.status === 404) return null;
    throw err;
  });

  if (!artist) notFound();

  if (artist.slug && artistId !== artist.slug) {
    permanentRedirect(`/map/${artist.slug}/overview`);
  }

  const queryClient = new QueryClient();

  // Seed artist cache so useArtist() on the client is a cache hit
  queryClient.setQueryData(['artist', artistId], artist);

  // fetchQuery (not prefetchQuery) so a backend failure reaches error.tsx instead of
  // being ISR-cached as an HTML page with no cards
  await queryClient.fetchQuery({
    queryKey: queryKey.mapData({ artistId: artist.id }),
    queryFn: () => eventsApi.getMapData({ status: 'all', artistId: artist.id }),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MapOverview artistId={artistId} />
    </HydrationBoundary>
  );
}
