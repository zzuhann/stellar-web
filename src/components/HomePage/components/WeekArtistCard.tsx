'use client';

import Image from 'next/image';
import Link from 'next/link';
import { css } from '@/styled-system/css';
import { Artist } from '@/types';
import CakeIcon from '@heroicons/react/24/outline/CakeIcon';
import { sendGAEvent } from '@next/third-parties/google';
import { useAuth } from '@/lib/auth-context';

function formatBirthdayShort(birthday: string): string {
  const [, month, day] = birthday.split('-').map(Number);
  if (isNaN(month) || isNaN(day)) return '';
  return `${month}/${day}`;
}

const cardLink = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '4',
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
  '&:hover': {
    boxShadow: 'shadow.md',
  },
});

const avatarWrapper = css({
  position: 'relative',
  width: '56px',
  height: '56px',
  borderRadius: 'radius.circle',
  overflow: 'hidden',
  flexShrink: 0,
  background: 'color.background.secondary',
});

const nameText = css({
  marginTop: '2.5',
  textStyle: 'caption',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  letterSpacing: '0.02em',
  width: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const zhNameText = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  marginTop: '0.5',
});

const divider = css({
  marginTop: '2.5',
  paddingTop: '2.5',
  width: '100%',
  borderTop: '1px dashed',
  borderTopColor: 'color.border.light',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const birthdayCol = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
});

const countText = css({
  color: 'color.primary',
  fontWeight: 'semibold',
});

const countEmptyText = css({
  color: 'color.text.disabled',
});

const iconStyle = css({
  flexShrink: 0,
  color: 'color.text.secondary',
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
          sizes="56px"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <p className={nameText}>{artist.stageName?.toUpperCase()}</p>
      <p className={zhNameText} aria-hidden={!artist.stageNameZh}>
        {artist.stageNameZh ?? ' '}
      </p>

      <div className={divider}>
        <span className={birthdayCol}>
          <CakeIcon width={14} height={14} className={iconStyle} aria-hidden="true" />
          {birthday}
        </span>
        {count > 0 ? (
          <span className={countText}>{count} 個</span>
        ) : (
          <span className={countEmptyText}>—</span>
        )}
      </div>
    </Link>
  );
}
