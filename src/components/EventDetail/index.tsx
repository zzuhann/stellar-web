import { css } from '@/styled-system/css';
import { parseSocialMediaHandles } from '@/utils/socialMedia';
import { ArrowTopRightOnSquareIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { InstagramIcon, ThreadsIcon } from '../ui/SocialMediaIcons';
import ExternalLink from '../ui/ExternalLink';
import FavoriteButton from './FavoriteButton';
import EventImageGallery from './EventImageGallery';
import BottomImagesGallery from './BottomImagesGallery';
import ArtistSection from './ArtistSection';
import BackToMapButton from './BackToMapButton';
import BackToHomeButton from './BackToHomeButton';
import ShareHandler from './ShareHandler';
import { CoffeeEvent } from '@/types';
import { formatEventDate, generateGoogleCalendarUrl } from '@/utils';
import PageViewTracker from '@/components/PageViewTracker';
import EventViewTracker from '@/components/EventViewTracker';
import Breadcrumb from '@/components/ui/Breadcrumb';

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
  userSelect: 'text',
  cursor: 'text',
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
  minWidth: '0',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
});

const detailValue = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  flexWrap: 'wrap',
  overflowWrap: 'break-word',
});

const addToCalendarLink = css({
  textStyle: 'bodySmall',
  color: 'color.link',
  marginLeft: '2',
  textDecoration: 'underline',
  '&:hover': {
    color: 'color.linkHover',
  },
});

const descriptionSection = css({
  marginTop: '4',
  paddingTop: '4',
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
  marginBottom: '2',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
});

const descriptionContent = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  whiteSpace: 'pre-wrap',
});

const buttonGroup = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '3',
  marginTop: '8',
  marginBottom: '5',
  '& > button': {
    minWidth: '200px',
  },
  '@media (min-width: 400px)': {
    flexDirection: 'row',
    justifyContent: 'center',
  },
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

  const primaryArtist = event.artists?.[0];
  const breadcrumbItems = [
    { label: '首頁', href: '/' },
    ...(primaryArtist
      ? [
          {
            label: `${primaryArtist.name} 生日應援地圖`,
            href: `/map/${primaryArtist.slug ?? primaryArtist.id}`,
          },
        ]
      : []),
    { label: event.title },
  ];

  return (
    <div className={pageContainer} id="main-content">
      <PageViewTracker eventPage="/event/[id]" contentId={event.id} />
      <EventViewTracker eventId={event.id} />
      <div className={mainContainer}>
        <Breadcrumb items={breadcrumbItems} />
        {/* Banner 區域 + 底部圖片列表 + Lightbox */}
        <EventImageGallery items={bannerItems} />

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
                  <ExternalLink
                    href={generateGoogleCalendarUrl({
                      title: event.title,
                      startDate: event.datetime.start,
                      endDate: event.datetime.end,
                      location: `${event.location.name} ${event.location.address}`,
                      eventId: event.id,
                    })}
                    platform="calendar"
                    eventPage="/event/[id]"
                    contentId={event.id}
                    className={addToCalendarLink}
                  >
                    加入行事曆
                  </ExternalLink>
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
                    {event.location.name}({event.location.address})&nbsp;
                    <ArrowTopRightOnSquareIcon
                      style={{ display: 'inline', verticalAlign: 'middle' }}
                      width={16}
                      height={16}
                      aria-hidden="true"
                    />
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

          <BottomImagesGallery items={bannerItems} />

          {/* 底部按鈕群組 */}
          <div className={buttonGroup}>
            <BackToMapButton event={event} />
            <BackToHomeButton eventId={event.id} />
          </div>
        </div>

        {/* 分享處理 - Client Component */}
        <ShareHandler title={event.title} />
      </div>
    </div>
  );
};

export default EventDetail;
