'use client';

import { useAuth } from '@/lib/auth-context';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import useFavoriteStatus from '@/hooks/useFavoriteStatus';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { css } from '@/styled-system/css';
import { sendGAEvent } from '@next/third-parties/google';

const button = css({
  display: 'none',
  '@media (min-width: 640px)': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: 'radius.circle',
    border: '1px solid',
    borderColor: 'color.border.light',
    backgroundColor: 'color.background.primary',
    cursor: 'pointer',
    flexShrink: '0',
    transition: 'background 0.2s ease, border-color 0.2s ease',
    '&:hover': {
      backgroundColor: 'color.background.secondary',
      borderColor: 'color.border.medium',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: '0.5',
    },
  },
});

const spinner = css({
  width: '18px',
  height: '18px',
  border: '2px solid',
  borderColor: 'color.border.light',
  borderTop: '2px solid',
  borderTopColor: 'color.primary',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
});

interface DesktopFavoriteButtonProps {
  eventId: string;
}

export default function DesktopFavoriteButton({ eventId }: DesktopFavoriteButtonProps) {
  const { user, toggleAuthModal } = useAuth();
  const favoriteToggle = useFavoriteToggle();
  const { data: favoriteStatus, isLoading } = useFavoriteStatus(eventId);

  const isFavorited = favoriteStatus?.isFavorited ?? false;
  const isPending = favoriteToggle.isPending;

  const handleClick = () => {
    if (!user) {
      toggleAuthModal(undefined, () => {
        favoriteToggle.mutate({ eventId, isFavorited: false });
      });
      return;
    }

    favoriteToggle.mutate({ eventId, isFavorited });

    sendGAEvent('event', isFavorited ? 'remove_from_favorite' : 'add_to_favorite', {
      event_page: '/event/[id]',
      user_id: user.uid,
      content_id: eventId,
    });
  };

  if (isLoading && !!user) {
    return <div className={button} style={{ pointerEvents: 'none' }} aria-hidden="true" />;
  }

  return (
    <button
      className={button}
      onClick={handleClick}
      disabled={isPending}
      aria-label={isPending ? '處理中' : isFavorited ? '取消收藏' : '收藏此活動'}
      aria-pressed={isPending ? undefined : isFavorited}
      aria-busy={isPending}
      type="button"
    >
      {isPending ? (
        <div className={spinner} aria-hidden="true" />
      ) : isFavorited ? (
        <HeartSolid width={18} height={18} color="var(--colors-red-500)" aria-hidden="true" />
      ) : (
        <HeartOutline
          width={18}
          height={18}
          color="var(--color-text-secondary)"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
