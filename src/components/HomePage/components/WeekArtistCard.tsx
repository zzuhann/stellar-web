'use client';

import Image from 'next/image';
import Link from 'next/link';
import { css } from '@/styled-system/css';
import { Artist } from '@/types';
import { sendGAEvent } from '@next/third-parties/google';
import { useAuth } from '@/lib/auth-context';
import { formatBirthdayShort } from '@/utils/birthdayHelpers';

const cardLink = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingX: '3',
  paddingY: '4',
  textAlign: 'center',
  textDecoration: 'none',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.sm',
  transition: 'box-shadow 0.2s ease',
  minWidth: '0',
  overflow: 'hidden',
  '&:hover': { boxShadow: 'shadow.md' },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

const avatarWrapper = css({
  position: 'relative',
  width: '80px',
  height: '80px',
  borderRadius: 'radius.circle',
  overflow: 'hidden',
  flexShrink: 0,
  background: 'color.background.secondary',
});

const nameText = css({
  marginTop: '2',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  letterSpacing: '0.02em',
  width: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const birthdayText = css({
  marginTop: '1',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const countRow = css({
  marginTop: '1',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.primary',
});

const countEmptyRow = css({
  marginTop: '3',
  textStyle: 'bodySmall',
  color: 'color.text.disabled',
});

interface WeekArtistCardProps {
  artist: Artist;
}

export default function WeekArtistCard({ artist }: WeekArtistCardProps) {
  const { user } = useAuth();
  const href = `/map/${artist.slug ?? artist.id}`;
  const birthday = formatBirthdayShort(artist.birthday ?? '');
  const count = artist.coffeeEventCount ?? 0;

  const handleClick = () => {
    sendGAEvent('event', 'click_artist_card', {
      event_page: '/',
      user_id: user?.uid ?? '',
      content_id: artist.id,
    });
  };

  return (
    <Link
      href={href}
      className={cardLink}
      aria-label={`前往 ${artist.stageName} 的生日應援地圖頁面`}
      onClick={handleClick}
    >
      <div className={avatarWrapper}>
        <Image
          src={artist.profileImage ?? '/default_profile.png'}
          alt={artist.stageName}
          fill
          sizes="80px"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <p className={nameText}>{artist.stageName?.toUpperCase()}</p>
      <p className={birthdayText}>{birthday}</p>
      {count > 0 ? <p className={countRow}>{count} 場應援</p> : <p className={countEmptyRow}>—</p>}
    </Link>
  );
}
