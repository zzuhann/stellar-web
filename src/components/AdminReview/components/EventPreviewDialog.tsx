'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SwiperBanner from '@/components/SwiperBanner';
import { InstagramIcon, ThreadsIcon } from '@/components/ui/SocialMediaIcons';
import { useScrollLock } from '@/hooks/useScrollLock';
import type { CoffeeEvent } from '@/types';
import { formatEventDate } from '@/utils';
import { parseSocialMediaHandles } from '@/utils/socialMedia';

interface EventPreviewDialogProps {
  event: CoffeeEvent;
  onClose: () => void;
}

export default function EventPreviewDialog({ event, onClose }: EventPreviewDialogProps) {
  useScrollLock(true);

  useEffect(() => {
    const handleKeyDown = (keyboardEvent: KeyboardEvent) =>
      keyboardEvent.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-overlay p-4"
      onMouseDown={(mouseEvent) => mouseEvent.target === mouseEvent.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-preview-title"
        className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-stellar-lg bg-surface shadow-stellar-lg"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-5 py-4">
          <h2 id="event-preview-title" className="text-lg font-semibold text-content">
            預覽
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉預覽"
            className="flex size-11 items-center justify-center rounded-stellar-md text-content hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-brand"
          >
            <XMarkIcon className="size-6" />
          </button>
        </header>

        {bannerItems.length > 0 && <SwiperBanner items={bannerItems} />}

        <div className="mb-6 bg-surface px-5 pb-4 pt-0">
          <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-content md:text-3xl">
            {event.title}
          </h2>

          <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-line pb-4">
            {event.artists.map((artist, index) => (
              <div key={artist.id || index} className="flex items-center">
                {index > 0 && <span className="mx-1 text-sm text-content-muted">/</span>}
                <Link
                  href={`/map/${artist.slug ?? artist.id}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-content"
                >
                  <span
                    className="size-6 shrink-0 rounded-stellar-circle bg-neutral-subtle bg-cover bg-center"
                    style={{
                      backgroundImage: artist.profileImage
                        ? `url(${artist.profileImage})`
                        : undefined,
                    }}
                  />
                  {artist.name || 'Unknown Artist'}
                </Link>
              </div>
            ))}
          </div>

          <h3 className="mb-4 text-lg font-semibold text-content">主辦</h3>
          <div className="flex flex-col gap-1">
            {event.socialMedia.instagram && (
              <div className="flex items-start gap-3 p-1">
                <InstagramIcon size={20} color="var(--color-text-secondary)" />
                <div className="text-sm text-content-muted">
                  {parseSocialMediaHandles(event.socialMedia.instagram).map(
                    (handle, index, handles) => (
                      <span key={handle}>
                        <a
                          href={`https://www.instagram.com/${handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand"
                        >
                          @{handle}
                        </a>
                        {index < handles.length - 1 && '、'}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
            {event.socialMedia.threads && (
              <div className="flex items-start gap-3 p-1">
                <ThreadsIcon size={20} color="var(--color-text-secondary)" />
                <div className="text-sm text-content-muted">
                  {parseSocialMediaHandles(event.socialMedia.threads).map(
                    (handle, index, handles) => (
                      <span key={handle}>
                        <a
                          href={`https://www.threads.net/@${handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand"
                        >
                          @{handle}
                        </a>
                        {index < handles.length - 1 && '、'}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <h3 className="mb-4 text-lg font-semibold text-content">時間/地點</h3>
            <div className="flex items-start gap-3 p-1">
              <CalendarIcon className="mt-0.5 size-5 shrink-0 text-content-muted" />
              <span className="text-sm text-content-muted">
                {formatEventDate(event.datetime.start, event.datetime.end)}
              </span>
            </div>
            <div className="flex items-start gap-3 p-1">
              <MapPinIcon className="mt-0.5 size-5 shrink-0 text-content-muted" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${event.location.coordinates.lat},${event.location.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand"
              >
                {event.location.name}({event.location.address})
              </a>
            </div>
          </div>

          {event.description && (
            <div className="mt-6 break-words border-t border-line pt-6">
              <h3 className="mb-4 text-lg font-semibold text-content">詳細說明</h3>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-content-muted">
                {event.description}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
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
              className="block h-auto w-full"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
