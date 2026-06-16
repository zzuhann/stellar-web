import { ImageResponse } from 'next/og';
import { artistsApi } from '@/lib/api';

export const runtime = 'nodejs';

export async function generateStaticParams() {
  const artists = await artistsApi.getAll({ status: 'approved' }).catch(() => []);
  return artists.map((a) => ({ artistId: a.slug ?? a.id }));
}

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

const FALLBACK_OG_IMAGE_URL = 'https://cdn.stellar-zone.com/images/og-image.png';

type ImageProps = {
  params: Promise<{
    artistId: string;
  }>;
};

export default async function Image({ params }: ImageProps) {
  const { artistId } = await params;
  const artist = await artistsApi.getById(artistId).catch(() => null);
  const artistImageUrl = artist?.profileImage || FALLBACK_OG_IMAGE_URL;
  const artistStageName = artist?.stageName || 'STELLAR';
  const title = artist ? `${artistStageName} 生日應援` : 'STELLAR 台灣生日應援地圖';

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#0f172a',
        color: '#ffffff',
      }}
    >
      <img
        src={artistImageUrl}
        alt={title}
        width={1200}
        height={630}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          inset: 0,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.72) 72%, rgba(15, 23, 42, 0.86) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 48,
          right: 48,
          bottom: 44,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 54,
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            textShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            fontWeight: 700,
            opacity: 0.94,
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
          }}
        >
          STELLAR 台灣生咖、生日應援地圖
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
