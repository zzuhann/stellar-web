import { formatEventDate } from './utils';
import { css } from '@/styled-system/css';
import { cleanSocialMediaHandle } from '@/utils/socialMedia';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import SwiperBanner from '../SwiperBanner';
import { InstagramIcon, ThreadsIcon, XIcon } from '../ui/SocialMediaIcons';
import Image from 'next/image';
import FavoriteButton from './FavoriteButton';
import ArtistSection from './ArtistSection';
import BackToMapButton from './BackToMapButton';
import ShareHandler from './ShareHandler';
import { CoffeeEvent } from '@/types';

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
  marginTop: '16px',
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
  wordBreak: 'break-word',
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

const bottomImagesContainer = css({
  marginTop: '24px',
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
