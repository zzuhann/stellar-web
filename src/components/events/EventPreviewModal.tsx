'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  LinkIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import SwiperBanner from '@/components/SwiperBanner';
import ModalOverlay from '@/components/ui/ModalOverlay';
import { InstagramIcon, ThreadsIcon } from '@/components/ui/SocialMediaIcons';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import type { CoffeeEvent } from '@/types';
import {
  formatEventDate,
  formatReservationDateTime,
  generateGoogleCalendarUrlAtTime,
  isHttpUrl,
  isPastTimestamp,
} from '@/utils';
import { parseSocialMediaHandles } from '@/utils/socialMedia';

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
  maxHeight: '90dvh',
  overflowY: 'auto',
  position: 'relative',
});

const modalHeader = css({
  position: 'sticky',
  top: 0,
  background: 'white',
  paddingY: '4',
  paddingX: '5',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 10,
});

const modalTitle = css({
  textStyle: 'h4',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  margin: '0',
});

const closeButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  background: 'none',
  border: 'none',
  color: 'color.text.primary',
  cursor: 'pointer',
  borderRadius: 'radius.md',
  transition: 'background 0.2s ease',
  '&:hover': {
    background: 'color.background.secondary',
  },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
  '& svg': {
    width: '24px',
    height: '24px',
  },
});

const contentSection = css({
  background: 'gray.0',
  paddingTop: '0',
  paddingX: '5',
  paddingBottom: '4',
  marginBottom: '6',
});

const eventTitle = css({
  textStyle: 'h3',
  color: 'color.text.primary',
  marginBottom: '4',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  '@media (min-width: 768px)': {
    textStyle: 'h2',
  },
});

const artistSection = css({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '2',
  marginBottom: '4',
  paddingBottom: '4',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
});

const artistLink = css({
  display: 'inline-flex',
  borderRadius: 'radius.md',
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

const artistItem = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1.5',
});

const artistAvatar = css({
  width: '24px',
  height: '24px',
  borderRadius: 'radius.circle',
  overflow: 'hidden',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: 'color.background.secondary',
  flexShrink: 0,
});

const artistName = css({
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  color: 'color.text.primary',
});

const artistSeparator = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  marginX: '1',
});

const eventDetailsSection = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
});

const detailItem = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '3',
  padding: '1',
});

const detailIcon = css({
  width: '20px',
  height: '20px',
  color: 'color.text.secondary',
  flexShrink: 0,
  marginTop: '0.5',
});

const detailContent = css({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
});

const detailValue = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const descriptionSection = css({
  marginTop: '6',
  paddingTop: '6',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  wordBreak: 'break-word',
});

const descriptionTitle = css({
  textStyle: 'h4',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  marginBottom: '4',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
});

const descriptionContent = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
});

const bottomImagesContainer = css({
  marginTop: '6',
});

const link = css({
  color: 'color.link',
});

const addToCalendarHint = css({
  textStyle: 'caption',
  color: 'color.link',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
});

// 「預約開始時間」列專用：時間文字與提醒 hint 並排同一行，跟其他列的上下堆疊不同
const reservationCalendarContent = css({
  flex: 1,
  minWidth: '0',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  columnGap: '2',
  rowGap: '0.5',
});

// Shared by the my-submissions preview and the admin review preview.
// The public EventDetail page is separate on purpose (server component, ISR, GA click tracking).
export default function EventPreviewModal({ event, isOpen, onClose }: EventPreviewModalProps) {
  useScrollLock(isOpen);
  const focusTrapRef = useFocusTrap<HTMLElement>(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (keyboardEvent: KeyboardEvent) =>
      keyboardEvent.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 預約開始時間已過去時，不再顯示「提醒我預約」（已經過去的時間點沒辦法再加行事曆提醒）
  const isReservationExpired = event.reservation?.startAt
    ? isPastTimestamp(event.reservation.startAt)
    : false;

  const bannerItems = [
    ...(event.mainImage
      ? [{ id: 'main', imageUrl: event.mainImage, title: event.title, subtitle: '主視覺' }]
      : []),
    ...(event.detailImage ?? []).map((imageUrl, index) => ({
      id: `detail-${index}`,
      imageUrl,
      title: event.title,
      subtitle: '應援詳情',
    })),
  ];

  return (
    <ModalOverlay isOpen={isOpen} zIndex={1000} padding="16px" onClick={onClose}>
      <section
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-preview-title"
        className={modalContent}
        onClick={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <header className={modalHeader}>
          <p className={modalTitle}>預覽</p>
          <button type="button" onClick={onClose} aria-label="關閉預覽" className={closeButton}>
            <XMarkIcon />
          </button>
        </header>

        {bannerItems.length > 0 && <SwiperBanner items={bannerItems} />}

        <div className={contentSection}>
          <h2 id="event-preview-title" className={eventTitle}>
            {event.title}
          </h2>

          <div className={artistSection}>
            {event.artists?.map((artist, index) => (
              <div key={artist.id || index} style={{ display: 'flex', alignItems: 'center' }}>
                {index > 0 && <span className={artistSeparator}>/</span>}
                <Link href={`/map/${artist.slug ?? artist.id}`} className={artistLink}>
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

          <h3 className={descriptionTitle}>主辦</h3>
          <div className={eventDetailsSection}>
            {event.socialMedia.instagram && (
              <div className={detailItem}>
                <div className={detailIcon}>
                  <InstagramIcon size={20} color="var(--color-text-secondary)" aria-hidden="true" />
                  <span className="sr-only">Instagram</span>
                </div>
                <div className={detailContent}>
                  <div className={detailValue}>
                    {parseSocialMediaHandles(event.socialMedia.instagram).map(
                      (handle, index, handles) => (
                        <span key={handle}>
                          <a
                            href={`https://www.instagram.com/${handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={link}
                          >
                            @{handle}
                          </a>
                          {index < handles.length - 1 && '、'}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {event.socialMedia.threads && (
              <div className={detailItem}>
                <div className={detailIcon}>
                  <ThreadsIcon size={20} color="var(--color-text-secondary)" aria-hidden="true" />
                  <span className="sr-only">Threads</span>
                </div>
                <div className={detailContent}>
                  <div className={detailValue}>
                    {parseSocialMediaHandles(event.socialMedia.threads).map(
                      (handle, index, handles) => (
                        <span key={handle}>
                          <a
                            href={`https://www.threads.com/@${handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={link}
                          >
                            @{handle}
                          </a>
                          {index < handles.length - 1 && '、'}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

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
                    href={`https://www.google.com/maps/search/?api=1&query=${event.location.coordinates.lat},${event.location.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={link}
                  >
                    {event.location.name}({event.location.address})
                  </a>
                </div>
              </div>
            </div>
          </div>

          {(event.reservation?.url || event.reservation?.startAt) && (
            <div className={descriptionSection}>
              <h3 className={descriptionTitle}>預約資訊</h3>
              <div className={eventDetailsSection}>
                {event.reservation?.url && isHttpUrl(event.reservation.url) && (
                  <div className={detailItem}>
                    <div className={detailIcon}>
                      <LinkIcon />
                    </div>
                    <div className={detailContent}>
                      <div className={detailValue}>
                        <a
                          href={event.reservation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={link}
                        >
                          前往預約頁面
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {event.reservation?.startAt && (
                  <div className={detailItem}>
                    <div className={detailIcon}>
                      <CalendarIcon />
                    </div>
                    <div
                      className={isReservationExpired ? detailContent : reservationCalendarContent}
                    >
                      <div className={detailValue}>
                        {formatReservationDateTime(event.reservation.startAt)}
                      </div>
                      {!isReservationExpired && (
                        <a
                          href={generateGoogleCalendarUrlAtTime({
                            title: `[預約提醒] - ${event.title}`,
                            startAt: event.reservation.startAt,
                            location: `${event.location.name} ${event.location.address}`,
                            eventSlugOrId: event.slug ?? event.id,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={addToCalendarHint}
                        >
                          提醒我預約
                          <ArrowTopRightOnSquareIcon width={12} height={12} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {event.description && (
            <div className={descriptionSection}>
              <h3 className={descriptionTitle}>詳細說明</h3>
              <div className={descriptionContent}>{event.description}</div>
            </div>
          )}
        </div>

        <div className={bottomImagesContainer}>
          {bannerItems.map((item, index) => (
            <Image
              key={item.id}
              src={item.imageUrl}
              alt={item.title}
              width={800}
              height={600}
              quality={95}
              priority={index === 0}
              sizes="500px"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          ))}
        </div>
      </section>
    </ModalOverlay>
  );
}
