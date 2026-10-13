'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { css, cva } from '@/styled-system/css';
import ArtistCard from '../ArtistCard';
import { Artist } from '@/types';

export type SubmitArtistCtaSource = 'view_map' | 'add_event';

const cardWrapper = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

// DOM order stays secondary -> primary; on mobile column-reverse puts primary on top without changing Tab order.
const ctaRow = css({
  display: 'flex',
  flexDirection: 'column-reverse',
  gap: '2',
  '@media (min-width: 480px)': {
    flexDirection: 'row',
    gap: '3',
  },
});

const ctaLink = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
    paddingX: '4',
    borderRadius: 'radius.lg',
    textStyle: 'button',
    textDecoration: 'none',
    border: '1px solid',
    borderColor: 'color.primary',
    cursor: 'pointer',
    transition: 'background 0.2s ease, color 0.2s ease',
    '@media (min-width: 480px)': {
      flex: 1,
    },
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'color.primary',
      outlineOffset: '2px',
    },
  },
  variants: {
    variant: {
      primary: {
        background: 'color.primary',
        color: 'white',
        '&:hover': { background: 'color.primaryHover', borderColor: 'color.primaryHover' },
      },
      secondary: {
        background: 'color.background.primary',
        color: 'color.primary',
        '&:hover': { background: 'color.background.secondary' },
      },
    },
  },
});

interface SubmitArtistResultCardProps {
  artist: Artist;
  // Fires before navigation so the caller can track the click and close the modal.
  onBeforeNavigate: (source: SubmitArtistCtaSource) => void;
}

export default function SubmitArtistResultCard({
  artist,
  onBeforeNavigate,
}: SubmitArtistResultCardProps) {
  const router = useRouter();
  const mapHref = `/map/${artist.slug ?? artist.id}`;
  const addEventHref = `/submit-event?artistId=${encodeURIComponent(artist.id)}`;

  const handleClick = (source: SubmitArtistCtaSource, href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onBeforeNavigate(source);
    router.push(href);
  };

  return (
    <div className={cardWrapper}>
      <ArtistCard artist={artist} hideEventCount />
      <div className={ctaRow}>
        <Link
          href={mapHref}
          className={ctaLink({ variant: 'secondary' })}
          aria-label={`查看 ${artist.stageName} 的生日應援`}
          onClick={handleClick('view_map', mapHref)}
        >
          查看應援
        </Link>
        <Link
          href={addEventHref}
          className={ctaLink({ variant: 'primary' })}
          aria-label={`為 ${artist.stageName} 新增生日應援`}
          onClick={handleClick('add_event', addEventHref)}
        >
          新增應援
        </Link>
      </div>
    </div>
  );
}
