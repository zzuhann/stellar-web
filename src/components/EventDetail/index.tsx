'use client';

import { useRouter } from 'next/navigation';
import { formatEventDate } from './utils';
import { useState } from 'react';
import { useEvent } from '@/hooks/useEvent';
import { css } from '@/styled-system/css';
import { cleanSocialMediaHandle } from '@/utils/socialMedia';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import SwiperBanner from '../SwiperBanner';
import { InstagramIcon, ThreadsIcon, XIcon } from '../ui/SocialMediaIcons';
import Image from 'next/image';
import ArtistModal from './ArtistModal';
import DetailSkeleton from './DetailSkeleton';
import { usePageShare } from '@/hooks/usePageShare';
import { useAuth } from '@/lib/auth-context';
import { useFavoriteToggle } from '@/hooks/useFavorite';

const pageContainer = css({
  minHeight: '100vh',
  backgroundColor: 'color.background.primary',
});

const mainContainer = css({
  paddingTop: '70px',
  maxWidth: '500px',
  margin: '0 auto',
  boxShadow: 'shadow.sm',
});

const errorContainer = css({
  textAlign: 'center',
  padding: '40px 20px',
});

const errorTitle = css({
  color: 'color.text.primary',
  marginBottom: '16px',
});

const errorMessage = css({
  color: 'color.text.secondary',
});

const contentSection = css({
  background: '#fff',
  padding: '0 20px 16px 20px',
  marginBottom: '24px',
});

const eventTitle = css({
  fontSize: '20px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: '0 0 16px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '@media (min-width: 768px)': {
    fontSize: '24px',
  },
});

const artistSection = css({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '8px',
  marginBottom: '16px',
  paddingBottom: '16px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
});

const artistItem = css({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
});

const artistAvatar = css({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  overflow: 'hidden',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: 'color.background.secondary',
  flexShrink: '0',
});

const artistName = css({
  fontSize: '14px',
  fontWeight: '500',
  color: 'color.text.primary',
});

const artistSeparator = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  margin: '0 4px',
});

const eventDetailsSection = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const detailItem = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '4px',
});

const detailIcon = css({
  flexShrink: '0',
  marginTop: '2px',
});

const detailContent = css({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const detailValue = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  lineHeight: '1.5',
});

const descriptionSection = css({
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
});

const descriptionTitle = css({
  fontSize: '18px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: '0 0 16px 0',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const descriptionContent = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap',
});

// 收藏 button
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

const ctaButton = css({
  padding: '10px 40px',
  borderRadius: 'var(--radius-lg)',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  background: 'color.primary',
  borderColor: 'color.primary',
  color: 'white',
  position: 'relative',
  left: '50%',
  transform: 'translateX(-50%)',
  marginTop: '32px',
  marginBottom: '20px',

  '&:hover': {
    background: '#3a5d7a',
    borderColor: '#3a5d7a',
    transform: 'translateX(-50%) translateY(-1px)',
  },

  '&:active': {
    transform: 'translateX(-50%) translateY(0)',
  },
});

const bottomImagesContainer = css({
  marginTop: '24px',
});

type EventDetailProps = {
  eventId: string;
};

const EventDetail = ({ eventId }: EventDetailProps) => {
  const router = useRouter();
  const [showArtistModal, setShowArtistModal] = useState(false);
  const { user, toggleAuthModal } = useAuth();
  const favoriteToggle = useFavoriteToggle();

  const { data: event, error, isLoading } = useEvent(eventId);

  const isFavorited = event?.isFavorited ?? false;

  const handleFavoriteClick = () => {
    if (!user) {
      toggleAuthModal();
      return;
    }
    if (!event) return;

    favoriteToggle.mutate({
      eventId: event.id,
      isFavorited,
    });
  };

  usePageShare({
    text: `${event?.title} | STELLAR 台灣生日應援地圖`,
    url: window.location.href,
  });

  const bannerItems = (() => {
    if (!event) return [];

    const items = [];

    if (event.mainImage) {
      items.push({
        id: 'main',
        imageUrl: event.mainImage,
        title: event.title,
        subtitle: '主視覺',
      });
    }

    // 詳細圖片
    if (event.detailImage && event.detailImage.length > 0) {
      event.detailImage.forEach((image, index) => {
        items.push({
          id: `detail-${index}`,
          imageUrl: image,
          title: event.title,
          subtitle: '應援詳情',
        });
      });
    }

    return items;
  })();

  const handleBackToMap = () => {
    if (!event?.artists || event.artists.length === 0) {
      return;
    }

    if (event.artists.length === 1) {
      // 只有一個藝人，直接跳轉
      router.push(`/map/${event.artists[0].id}`);
    } else {
      // 多個藝人時需選擇藝人
      setShowArtistModal(true);
    }
  };

  const handleArtistSelect = (artistId: string) => {
    setShowArtistModal(false);
    router.push(`/map/${artistId}`);
  };

  const handleCloseModal = () => {
    setShowArtistModal(false);
  };

  return (
    <div className={pageContainer}>
      <div className={mainContainer}>
        {isLoading && <DetailSkeleton />}

        {error && (
          <div className={errorContainer}>
            <h1 className={errorTitle}>載入失敗</h1>
            <p className={errorMessage}>載入生日應援時發生錯誤</p>
          </div>
        )}

        {event && !isLoading && !error && (
          <>
            {/* Banner 區域 */}
            {bannerItems.length > 0 && <SwiperBanner items={bannerItems} />}

            {/* 主要內容 */}
            <div className={contentSection}>
              <button
                className={isFavorited ? favoriteButtonActive : favoriteButton}
                onClick={handleFavoriteClick}
                disabled={favoriteToggle.isPending}
              >
                {isFavorited ? (
                  <HeartSolid width={20} height={20} color="white" />
                ) : (
                  <HeartOutline width={20} height={20} color="var(--color-text-secondary)" />
                )}
                {isFavorited ? '已收藏' : '收藏'}
              </button>
              <h2 className={eventTitle}>{event.title}</h2>

              {/* 藝人資訊 */}
              <div className={artistSection}>
                {event.artists?.map((artist, index) => (
                  <div key={artist.id || index} style={{ display: 'flex', alignItems: 'center' }}>
                    {index > 0 && <span className={artistSeparator}>/</span>}
                    <div className={artistItem} onClick={() => router.push(`/map/${artist.id}`)}>
                      <div
                        className={artistAvatar}
                        style={{ backgroundImage: `url(${artist.profileImage})` }}
                      />
                      <span className={artistName}>{artist.name || 'Unknown Artist'}</span>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className={descriptionTitle}>主辦</h3>
              <div className={eventDetailsSection}>
                {event.socialMedia.instagram && (
                  <div className={detailItem}>
                    <InstagramIcon size={20} color="var(--color-text-secondary)" />
                    <div className={detailContent}>
                      <div className={detailValue}>
                        <a
                          href={`https://www.instagram.com/${cleanSocialMediaHandle(event.socialMedia.instagram)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3a64c7' }}
                        >
                          @{cleanSocialMediaHandle(event.socialMedia.instagram)}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {event.socialMedia.threads && (
                  <div className={detailItem}>
                    <ThreadsIcon size={20} color="var(--color-text-secondary)" />
                    <div className={detailContent}>
                      <div className={detailValue}>
                        <a
                          href={`https://www.threads.net/@${cleanSocialMediaHandle(event.socialMedia.threads)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3a64c7' }}
                        >
                          @{cleanSocialMediaHandle(event.socialMedia.threads)}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {event.socialMedia.x && (
                  <div className={detailItem}>
                    <XIcon size={20} color="var(--color-text-secondary)" />
                    <div className={detailContent}>
                      <div className={detailValue}>
                        <a
                          href={`https://x.com/${cleanSocialMediaHandle(event.socialMedia.x)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3a64c7' }}
                        >
                          @{cleanSocialMediaHandle(event.socialMedia.x)}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 活動詳情 */}
              <div className={descriptionSection}>
                <h3 className={descriptionTitle}>時間/地點</h3>
                <div className={detailItem}>
                  <div className={detailIcon}>
                    <CalendarIcon width={20} height={20} color="var(--color-text-secondary)" />
                  </div>
                  <div className={detailContent}>
                    <div className={detailValue}>
                      {formatEventDate(event.datetime.start, event.datetime.end)}
                    </div>
                  </div>
                </div>

                <div className={detailItem}>
                  <div className={detailIcon}>
                    <MapPinIcon width={20} height={20} color="var(--color-text-secondary)" />
                  </div>
                  <div className={detailContent}>
                    <div className={detailValue}>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${event.location.coordinates.lat},${event.location.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3a64c7' }}
                      >
                        {event.location.name}({event.location.address}){' '}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* 活動說明 */}
              {event.description && (
                <div className={descriptionSection}>
                  <h3 className={descriptionTitle}>詳細說明</h3>
                  <div className={descriptionContent}>{event.description}</div>
                </div>
              )}

              <div className={bottomImagesContainer}>
                {bannerItems.map((item, index) => (
                  <div key={item.id}>
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={800}
                      height={600}
                      quality={95}
                      priority={index === 0}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* 回到地圖頁按鈕 */}
              <button className={ctaButton} onClick={handleBackToMap}>
                回地圖頁
                <br />
                看其他生日應援
              </button>
            </div>
          </>
        )}
      </div>

      {showArtistModal && event && (
        <ArtistModal
          event={event}
          handleArtistSelect={handleArtistSelect}
          handleCloseModal={handleCloseModal}
        />
      )}
    </div>
  );
};

export default EventDetail;
