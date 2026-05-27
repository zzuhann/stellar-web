import Link from 'next/link';
import Image from 'next/image';
import { css } from '@/styled-system/css';
import type { Venue } from '@/types';

const section = css({
  padding: '20px 0 8px',
});

const header = css({
  padding: '0 16px 10px',
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '10px',
});

const sectionTitle = css({
  margin: 0,
  fontSize: '15px',
  fontWeight: 700,
  color: 'color.text.primary',
});

const seeAllLink = css({
  fontSize: '12px',
  color: 'color.primary',
  textDecoration: 'none',
  fontWeight: 500,
  flexShrink: 0,
  '&:hover': {
    textDecoration: 'underline',
  },
});

const trackWrap = css({
  position: 'relative',
});

const track = css({
  display: 'flex',
  gap: '10px',
  padding: '0 16px 12px',
  overflowX: 'auto',
  overflowY: 'hidden',
  scrollSnapType: 'x mandatory',
  scrollPaddingLeft: '16px',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const card = css({
  flex: '0 0 auto',
  width: '140px',
  scrollSnapAlign: 'start',
  textDecoration: 'none',
  display: 'block',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  boxShadow: 'shadow.sm',
  transition: 'box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: 'shadow.md',
  },
});

const coverWrap = css({
  position: 'relative',
  width: '140px',
  height: '96px',
  background: 'gray.100',
  overflow: 'hidden',
});

const coverPlaceholder = css({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background:
    'repeating-linear-gradient(135deg, var(--colors-gray-100) 0 10px, var(--colors-gray-50) 10px 20px)',
  color: 'gray.400',
});

const cardBody = css({
  padding: '8px 10px 10px',
});

const cardName = css({
  margin: 0,
  fontSize: '12px',
  fontWeight: 600,
  color: 'color.text.primary',
  lineHeight: 1.4,
  overflow: 'hidden',
  lineClamp: 2,
});

const cardMeta = css({
  marginTop: '4px',
  fontSize: '11px',
  color: 'color.text.secondary',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const fadeRight = css({
  position: 'absolute',
  top: 0,
  bottom: '12px',
  right: 0,
  width: '40px',
  background: 'linear-gradient(to left, rgba(255,255,255,1) 10%, rgba(255,255,255,0))',
  pointerEvents: 'none',
});

interface RelatedVenuesStripProps {
  venues: Venue[];
  region: string;
}

export default function RelatedVenuesStrip({ venues, region }: RelatedVenuesStripProps) {
  if (venues.length === 0) return null;

  return (
    <section aria-label={`${region} 的其他場地`} className={section}>
      <div className={header}>
        <h2 className={sectionTitle}>{region} 的其他場地</h2>
        <Link href="/venues" className={seeAllLink}>
          查看全部
        </Link>
      </div>

      <div className={trackWrap}>
        <div role="list" className={track}>
          {venues.map((venue) => (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              role="listitem"
              className={card}
            >
              <div className={coverWrap}>
                {venue.coverPhoto ? (
                  <Image
                    src={venue.coverPhoto}
                    alt={`${venue.name} 場地照片`}
                    fill
                    style={{ objectFit: 'cover' }}
                    unoptimized
                    sizes="140px"
                  />
                ) : (
                  <div className={coverPlaceholder} aria-hidden="true">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 7h3l2-2h6l2 2h3v12H4z" />
                      <circle cx="12" cy="13" r="3.5" />
                      <path d="M3 3l18 18" />
                    </svg>
                  </div>
                )}
              </div>
              <div className={cardBody}>
                <h3 className={cardName}>{venue.name}</h3>
                {venue.nearestMrt ? (
                  <div className={cardMeta}>M {venue.nearestMrt}</div>
                ) : venue.capacityRange ? (
                  <div className={cardMeta}>容納 {venue.capacityRange} 人</div>
                ) : null}
              </div>
            </Link>
          ))}
          <div style={{ flex: '0 0 6px' }} aria-hidden="true" />
        </div>
        {venues.length > 2 && <div aria-hidden="true" className={fadeRight} />}
      </div>
    </section>
  );
}
