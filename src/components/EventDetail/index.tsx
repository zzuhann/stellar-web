import { css } from '@/styled-system/css';
import { parseSocialMediaHandles } from '@/utils/socialMedia';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import SwiperBanner from '../SwiperBanner';
import { InstagramIcon, ThreadsIcon, XIcon } from '../ui/SocialMediaIcons';
import ExternalLink from '../ui/ExternalLink';
import Image from 'next/image';
import FavoriteButton from './FavoriteButton';
import ArtistSection from './ArtistSection';
import BackToMapButton from './BackToMapButton';
import ShareHandler from './ShareHandler';
import { CoffeeEvent } from '@/types';
import { formatEventDate } from '@/utils';
import PageViewTracker from '@/components/PageViewTracker';

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
  paddingY: '10',
  paddingX: '5',
  marginTop: '4',
});

const errorTitle = css({
  color: 'color.text.primary',
  marginBottom: '4',
});

const errorMessage = css({
  color: 'color.text.secondary',
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
  marginTop: '0',
  marginX: '0',
  marginBottom: '4',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
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
  flexShrink: '0',
  marginTop: '0.5',
});

const detailContent = css({
  flex: '1',
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
  marginTop: '0',
  marginX: '0',
  marginBottom: '4',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
});

const descriptionContent = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  whiteSpace: 'pre-wrap',
});

const bottomImagesContainer = css({
  marginTop: '6',
});

interface EventDetailProps {
  event: CoffeeEvent | null;
}

const EventDetail = ({ event }: EventDetailProps) => {
  if (!event) {
    return (
      <div className={pageContainer}>
        <div className={mainContainer}>
          <div className={errorContainer}>
            <h1 className={errorTitle}>找不到活動</h1>
            <p className={errorMessage}>此生日應援不存在或已被移除</p>
          </div>
        </div>
      </div>
    );
  }

  const bannerItems = [];

  if (event.mainImage) {
    bannerItems.push({
      id: 'main',
      imageUrl: event.mainImage,
      title: event.title,
      subtitle: '主視覺',
    });
  }

  // 詳細圖片
  if (event.detailImage && event.detailImage.length > 0) {
    event.detailImage.forEach((image, index) => {
      bannerItems.push({
        id: `detail-${index}`,
        imageUrl: image,
        title: event.title,
        subtitle: '應援詳情',
      });
    });
  }

  return (
    <div className={pageContainer}>
      <PageViewTracker eventPage="/event/[id]" contentId={event.id} />
      <div className={mainContainer}>
        {/* Banner 區域 */}
        {bannerItems.length > 0 && <SwiperBanner items={bannerItems} />}

        {/* 主要內容 */}
        <div className={contentSection}>
          {/* 收藏按鈕 - Client Component */}
          <FavoriteButton eventId={event.id} eventTitle={event.title} />

          <h2 className={eventTitle}>{event.title}</h2>

          {/* 藝人資訊 - Client Component */}
          <ArtistSection artists={event.artists} />

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
                      (handle, idx, arr) => (
                        <span key={handle}>
                          <ExternalLink
                            href={`https://www.instagram.com/${handle}`}
                            platform="instagram"
                            eventPage="/event/[id]"
                            contentId={event.id}
                            style={{ color: 'var(--colors-stellar-blue-500)' }}
                          >
                            @{handle}
                            <span className="sr-only">（在新視窗開啟）</span>
                          </ExternalLink>
                          {idx < arr.length - 1 && '、'}
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
                    {parseSocialMediaHandles(event.socialMedia.threads).map((handle, idx, arr) => (
                      <span key={handle}>
                        <ExternalLink
                          href={`https://www.threads.net/@${handle}`}
                          platform="threads"
                          eventPage="/event/[id]"
                          contentId={event.id}
                          style={{ color: 'var(--colors-stellar-blue-500)' }}
                        >
                          @{handle}
                          <span className="sr-only">（在新視窗開啟）</span>
                        </ExternalLink>
                        {idx < arr.length - 1 && '、'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {event.socialMedia.x && (
              <div className={detailItem}>
                <div className={detailIcon}>
                  <XIcon size={20} color="var(--color-text-secondary)" aria-hidden="true" />
                  <span className="sr-only">X</span>
                </div>
                <div className={detailContent}>
                  <div className={detailValue}>
                    {parseSocialMediaHandles(event.socialMedia.x).map((handle, idx, arr) => (
                      <span key={handle}>
                        <ExternalLink
                          href={`https://x.com/${handle}`}
                          platform="x"
                          eventPage="/event/[id]"
                          contentId={event.id}
                          style={{ color: 'var(--colors-stellar-blue-500)' }}
                        >
                          @{handle}
                          <span className="sr-only">（在新視窗開啟）</span>
                        </ExternalLink>
                        {idx < arr.length - 1 && '、'}
                      </span>
                    ))}
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
                <CalendarIcon
                  width={20}
                  height={20}
                  color="var(--color-text-secondary)"
                  aria-hidden="true"
                />
                <span className="sr-only">活動時間</span>
              </div>
              <div className={detailContent}>
                <div className={detailValue}>
                  {formatEventDate(event.datetime.start, event.datetime.end)}
                </div>
              </div>
            </div>

            <div className={detailItem}>
              <div className={detailIcon}>
                <MapPinIcon
                  width={20}
                  height={20}
                  color="var(--color-text-secondary)"
                  aria-hidden="true"
                />
                <span className="sr-only">活動地點</span>
              </div>
              <div className={detailContent}>
                <div className={detailValue}>
                  <ExternalLink
                    href={`https://www.google.com/maps/search/?api=1&query=${event.location.coordinates.lat},${event.location.coordinates.lng}`}
                    platform="location"
                    eventPage="/event/[id]"
                    contentId={event.id}
                    style={{ color: 'var(--colors-stellar-blue-500)' }}
                  >
                    {event.location.name}({event.location.address})
                    <span className="sr-only">（在新視窗開啟 Google 地圖）</span>
                  </ExternalLink>
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

          {/* 回到地圖頁按鈕 - Client Component */}
          <BackToMapButton event={event} />
        </div>

        {/* 分享處理 - Client Component */}
        <ShareHandler title={event.title} />
      </div>
    </div>
  );
};

export default EventDetail;
