import { css } from '@/styled-system/css';

const mapWrap = css({
  marginTop: '2',
  marginBottom: '2',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  aspectRatio: '16 / 9',
  background: 'color.background.secondary',
});

const mapFrame = css({
  display: 'block',
  width: '100%',
  height: '100%',
  border: 0,
});

interface VenueMapEmbedProps {
  placeId?: string;
  venueName: string;
}

export default function VenueMapEmbed({ placeId, venueName }: VenueMapEmbedProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY;
  if (!placeId || !apiKey) return null;

  const query = encodeURIComponent(`place_id:${placeId}`);

  return (
    <div className={mapWrap}>
      <iframe
        className={mapFrame}
        title={`${venueName}的 Google 地圖`}
        src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
