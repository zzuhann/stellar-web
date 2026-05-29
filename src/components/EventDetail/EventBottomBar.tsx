'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import useFavoriteStatus from '@/hooks/useFavoriteStatus';
import { useWebShare } from '@/hooks/useWebShare';
import { HeartIcon as HeartOutline, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { css } from '@/styled-system/css';
import { sendGAEvent } from '@next/third-parties/google';
import LoginPromptSheet from './LoginPromptSheet';
import { CoffeeEvent } from '@/types';

const bottomBar = css({
  position: 'fixed',
  bottom: '0',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: '500px',
  zIndex: '100',
  height: '64px',
  backgroundColor: 'color.background.primary',
  display: 'flex',
  alignItems: 'stretch',
  '@media (min-width: 640px)': {
    display: 'none',
  },
});

const actionButton = css({
  display: 'flex',
  flex: '1',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1',
  height: '100%',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  '&:hover': {
    backgroundColor: 'color.background.secondary',
  },
  '&:disabled': {
    cursor: 'not-allowed',
    opacity: '0.6',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '-2px',
  },
});

const actionLabel = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const divider = css({
  width: '1px',
  height: '50%',
  backgroundColor: 'color.border.light',
  flexShrink: '0',
  alignSelf: 'center',
});

const spinner = css({
  width: '20px',
  height: '20px',
  border: '2px solid',
  borderColor: 'color.border.light',
  borderTop: '2px solid',
  borderTopColor: 'color.primary',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
});

const skeletonCircle = css({
  width: '24px',
  height: '24px',
  borderRadius: 'radius.circle',
  backgroundColor: 'color.border.light',
});

interface EventBottomBarProps {
  event: CoffeeEvent;
}

export default function EventBottomBar({ event }: EventBottomBarProps) {
  const { user, toggleAuthModal } = useAuth();
  const favoriteToggle = useFavoriteToggle();
  const { data: favoriteStatus, isLoading: isFavoriteStatusLoading } = useFavoriteStatus(event.id);
  const { share } = useWebShare();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isFavorited = favoriteStatus?.isFavorited ?? false;
  const isPending = favoriteToggle.isPending;

  const handleShare = () => {
    share({
      title: event.title,
      text: '我在 STELLAR 看到這個生日應援！',
      url: typeof window !== 'undefined' ? window.location.href : '',
    });
  };

  const handleFavoriteClick = () => {
    if (!user) {
      setIsSheetOpen(true);
      return;
    }

    favoriteToggle.mutate({ eventId: event.id, isFavorited });

    sendGAEvent('event', isFavorited ? 'remove_from_favorite' : 'add_to_favorite', {
      event_page: '/event/[id]',
      user_id: user.uid,
      content_id: event.id,
    });
  };

  const handleLoginToFavorite = () => {
    setIsSheetOpen(false);
    toggleAuthModal(undefined, () => {
      favoriteToggle.mutate({ eventId: event.id, isFavorited: false });
    });
  };

  const handleShareFromSheet = () => {
    setIsSheetOpen(false);
    handleShare();
  };

  const isLoading = isFavoriteStatusLoading && !!user;

  return (
    <>
      <div
        className={bottomBar}
        style={{
          boxShadow: '0 -2px 8px rgba(0,0,0,0.10)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Share button */}
        {isLoading ? (
          <div className={actionButton} style={{ pointerEvents: 'none' }} aria-hidden="true">
            <div className={skeletonCircle} />
          </div>
        ) : (
          <button
            className={actionButton}
            onClick={handleShare}
            aria-label="分享此活動"
            type="button"
          >
            <ArrowUpOnSquareIcon
              width={22}
              height={22}
              color="var(--color-text-secondary)"
              aria-hidden="true"
            />
            <span className={actionLabel}>分享</span>
          </button>
        )}

        <div className={divider} aria-hidden="true" />

        {/* Favorite button */}
        {isLoading ? (
          <div className={actionButton} style={{ pointerEvents: 'none' }} aria-hidden="true">
            <div className={skeletonCircle} />
          </div>
        ) : (
          <button
            className={actionButton}
            onClick={handleFavoriteClick}
            disabled={isPending}
            aria-label={isPending ? '處理中' : isFavorited ? '取消收藏' : '收藏此活動'}
            aria-pressed={isPending ? undefined : isFavorited}
            aria-busy={isPending}
            type="button"
          >
            {isPending ? (
              <div className={spinner} aria-hidden="true" />
            ) : isFavorited ? (
              <HeartSolid width={22} height={22} color="var(--colors-red-500)" aria-hidden="true" />
            ) : (
              <HeartOutline
                width={22}
                height={22}
                color="var(--color-text-secondary)"
                aria-hidden="true"
              />
            )}
            <span className={actionLabel}>{isFavorited ? '已收藏' : '收藏'}</span>
          </button>
        )}
      </div>

      <LoginPromptSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onLoginToFavorite={handleLoginToFavorite}
        onShare={handleShareFromSheet}
      />
    </>
  );
}
