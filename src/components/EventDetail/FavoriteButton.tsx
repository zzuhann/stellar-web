'use client';

import { useAuth } from '@/lib/auth-context';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { css } from '@/styled-system/css';
import useFavoriteStatus from '@/hooks/useFavoriteStatus';
import { sendGAEvent } from '@next/third-parties/google';
import { isPWAMode } from '@/utils/pwa';

const favoriteButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: 'var(--radius-lg)',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'color.text.secondary',
  color: 'color.text.secondary',
  marginBottom: '16px',
  background: 'transparent',

  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  '&:hover': {
    background: 'color.background.secondary',
  },

  '&:active': {
    transform: 'translateY(0)',
  },
});

const favoriteButtonActive = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: 'var(--radius-lg)',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: '#ff6362',
  color: 'white',
  background: '#ff6362',
  marginBottom: '16px',

  '&:disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },

  '&:hover': {
    background: '#e65958',
    borderColor: '#e65958',
  },

  '&:active': {
    transform: 'translateY(0)',
  },
});

interface FavoriteButtonProps {
  eventId: string;
  eventTitle: string;
}

export default function FavoriteButton({ eventId, eventTitle }: FavoriteButtonProps) {
  const { user, toggleAuthModal } = useAuth();
  const favoriteToggle = useFavoriteToggle();
  const { data: favoriteStatus, isLoading: isFavoriteStatusLoading } = useFavoriteStatus(eventId);

  const isFavorited = favoriteStatus?.isFavorited ?? false;

  const handleFavoriteClick = () => {
    if (!user) {
      toggleAuthModal(undefined, () => {
        favoriteToggle.mutate({
          eventId,
          isFavorited,
        });
      });
      return;
    }

    favoriteToggle.mutate({
      eventId,
      isFavorited,
    });

    sendGAEvent('event', 'click_favorite_button', {
      environment: isPWAMode() ? 'pwa' : 'web',
      event_page: '/event/[id]',
      user_id: user?.uid ?? '',
      is_favorited: !isFavorited,
    });
  };

  return (
    <button
      className={isFavorited ? favoriteButtonActive : favoriteButton}
      onClick={handleFavoriteClick}
      disabled={favoriteToggle.isPending || isFavoriteStatusLoading}
      aria-label={isFavorited ? `取消收藏「${eventTitle}」` : `收藏「${eventTitle}」`}
      aria-pressed={isFavorited}
      aria-busy={favoriteToggle.isPending}
    >
      {isFavorited ? (
        <HeartSolid width={20} height={20} color="white" aria-hidden="true" />
      ) : (
        <HeartOutline
          width={20}
          height={20}
          color="var(--color-text-secondary)"
          aria-hidden="true"
        />
      )}
      <span aria-hidden="true">{isFavorited ? '已收藏' : '收藏'}</span>
    </button>
  );
}
