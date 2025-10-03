'use client';

import { css } from '@/styled-system/css';
import { CoffeeEvent } from '@/types';
import SwiperBanner from '@/components/SwiperBanner';
import { firebaseTimestampToDate } from '@/utils';
import { CalendarIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { InstagramIcon, ThreadsIcon, XIcon } from '../ui/SocialMediaIcons';
import { useScrollLock } from '@/hooks/useScrollLock';
import { cleanSocialMediaHandle } from '@/utils/socialMedia';
import Image from 'next/image';
import Link from 'next/link';
import ModalOverlay from '../ui/ModalOverlay';

interface EventPreviewModalProps {
  event: CoffeeEvent;
  isOpen: boolean;
  onClose: () => void;
}

const modalContent = css({
  background: 'white',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.lg',
  maxWidth: '500px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
});

const modalHeader = css({
  position: 'sticky',
  top: 0,
  background: 'white',
  padding: '16px 20px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 10,
});

const modalTitle = css({
  fontSize: '18px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: '0',
});

const closeButton = css({
  background: 'none',
  border: 'none',
  color: 'color.text.primary',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: 'radius.sm',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'color.background.secondary',
  },
  '& svg': {
    width: '24px',
    height: '24px',
  },
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
  flexShrink: 0,
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
  width: '20px',
  height: '20px',
  color: 'color.text.secondary',
  flexShrink: 0,
  marginTop: '2px',
});

const detailContent = css({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const detailValue = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  lineHeight: 1.5,
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
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
});

const bottomImagesContainer = css({
  marginTop: '24px',
});

export default function EventPreviewModal({ event, isOpen, onClose }: EventPreviewModalProps) {
  // 使用 scroll lock hook
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const formatEventDate = (startDate: any, endDate: any) => {
    const start = firebaseTimestampToDate(startDate);
    const end = firebaseTimestampToDate(endDate);

    const startStr = start.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const endStr = end.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
  };

  // 準備 banner 數據
  const getBannerItems = () => {
    const items = [];

    // 主圖
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
  };

  return (
    <ModalOverlay isOpen={isOpen} zIndex={100} padding="16px" onClick={onClose}>
      <div className={modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={modalHeader}>
          <h2 className={modalTitle}>預覽</h2>
          <button className={closeButton} onClick={onClose}>
            <XMarkIcon />
          </button>
        </div>

        {/* Banner 區域 */}
        {getBannerItems().length > 0 && <SwiperBanner items={getBannerItems()} />}

        {/* 主要內容 */}
        <div className={contentSection}>
          <h2 className={eventTitle}>{event.title}</h2>

          {/* 藝人資訊 */}
          <div className={artistSection}>
            {event.artists?.map((artist, index) => (
              <div key={artist.id || index} style={{ display: 'flex', alignItems: 'center' }}>
                {index > 0 && <span className={artistSeparator}>/</span>}
                <Link href={`/map/${artist.id}`}>
                  <div className={artistItem}>
                    <div
                      className={artistAvatar}
                      style={{
                        backgroundImage: artist.profileImage
                          ? `url(${artist.profileImage})`
                          : undefined,
                      }}
                    />
                    <span className={artistName}>{artist.name || 'Unknown Artist'}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* 主辦資訊 */}
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

          {/* 時間地點 */}
          <div className={descriptionSection}>
            <h3 className={descriptionTitle}>時間/地點</h3>
            <div className={detailItem}>
              <div className={detailIcon}>
                <CalendarIcon />
              </div>
              <div className={detailContent}>
                <div className={detailValue}>
                  {formatEventDate(event.datetime.start, event.datetime.end)}
                </div>
              </div>
            </div>

            <div className={detailItem}>
              <div className={detailIcon}>
                <MapPinIcon />
              </div>
              <div className={detailContent}>
                <div className={detailValue}>
                  <a
                    // 帶入 lat, lng
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
        </div>

        {/* Banner 項目圖片 - 滿版顯示 */}
        <div className={bottomImagesContainer}>
          {getBannerItems().map((item, index) => (
            <div key={item.id}>
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={800}
                height={600}
                quality={95}
                priority={index === 0}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </ModalOverlay>
  );
}
