import { CoffeeEvent } from '@/types';
import { css, cva } from '@/styled-system/css';
import { firebaseTimestampToDate, formatEventDate } from '@/utils';
import { FirebaseTimestamp } from '@/types';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const verticalEventCardContainer = css({
  display: 'flex',
  flexDirection: 'column',
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  transition: 'all 0.2s ease',
  boxShadow: 'shadow.sm',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: 'shadow.md',
  },
});

const eventImageStyle = css({
  width: '100%',
  aspectRatio: '3/4',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundColor: 'color.background.secondary',
  position: 'relative',
});

const imageOverlay = cva({
  base: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    background:
      'linear-gradient(to top, var(--colors-alpha-black-30) 0%, var(--colors-alpha-black-20) 50%, var(--colors-alpha-black-10) 100%)',
    padding: '16px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  variants: {
    isApproved: {
      true: {
        cursor: 'pointer',
      },
      false: {},
    },
  },
});

const buttonContainer = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minHeight: '60px',
  padding: '8px 16px',
});

const eventTitle = css({
  textStyle: 'bodyStrong',
  color: 'white',
  margin: '0 0 8px 0',
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  lineClamp: 2,
});

const eventArtistSection = css({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '4px',
  textStyle: 'bodySmall',
  color: 'alpha.white.90',
  marginBottom: '8px',
});

const eventArtistItem = css({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const eventArtistAvatar = css({
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

const eventArtistName = css({
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  color: 'alpha.white.90',
});

const eventArtistSeparator = css({
  textStyle: 'bodySmall',
  color: 'alpha.white.70',
  margin: '0 2px',
});

const eventDetails = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  textStyle: 'bodySmall',
  color: 'white',
});

const eventDetailItem = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '4px',
});

const detailText = css({
  // 最多兩行
  display: '-webkit-box',
  WebkitLineClamp: 2,
  lineClamp: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const styledSubmissionTime = css({
  textStyle: 'caption',
  color: 'alpha.white.70',
  marginTop: '4px',
});

const statusBadge = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    padding: '6px 8px',
    borderRadius: 'radius.md',
    textStyle: 'bodySmall',
    fontWeight: 'semibold',
    position: 'absolute',
    top: '6px',
    right: '6px',
    zIndex: 1,
  },
  variants: {
    status: {
      approved: {
        background: 'green.50',
        color: 'green.800',
      },
      rejected: {
        background: 'red.50',
        color: 'red.800',
      },
      pending: {
        background: 'amber.50',
        color: 'amber.800',
      },
    },
  },
  defaultVariants: {
    status: 'pending',
  },
});

const getStatusText = (status: 'pending' | 'approved' | 'rejected', rejectedReason?: string) => {
  switch (status) {
    case 'approved':
      return '已通過';
    case 'rejected':
      return `未通過：${rejectedReason}`;
    case 'pending':
    default:
      return '審核中';
  }
};

interface VerticalEventCardProps {
  event: CoffeeEvent;
  actionButtons?: React.ReactElement;
}

const VerticalEventCard = ({ event, actionButtons }: VerticalEventCardProps) => {
  const pathname = usePathname();
  const isShowSubmissionInfo = pathname !== '/' && pathname !== '/my-favorite';
  const submissionTime = event.createdAt
    ? firebaseTimestampToDate(event.createdAt as FirebaseTimestamp).toLocaleDateString('zh-TW')
    : '';

  // 如果同一天就只顯示一天
  const eventDateText = formatEventDate(event.datetime.start, event.datetime.end);

  return (
    <>
      {event.status === 'approved' && (
        <div className={verticalEventCardContainer}>
          <Link href={`/event/${event.id}`}>
            <div
              className={eventImageStyle}
              style={{ backgroundImage: `url(${event.mainImage ?? ''})` }}
            >
              {isShowSubmissionInfo && (
                <span className={statusBadge({ status: event.status })}>
                  {getStatusText(event.status, event.rejectedReason)}
                </span>
              )}

              <div className={imageOverlay({ isApproved: true })}>
                <h3 className={eventTitle}>{event.title}</h3>

                {event.artists && event.artists.length > 0 && (
                  <div className={eventArtistSection}>
                    {event.artists.map((artist, index) => (
                      <div
                        key={artist.id || index}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        {index > 0 && <span className={eventArtistSeparator}>/</span>}
                        <div className={eventArtistItem}>
                          <div
                            className={eventArtistAvatar}
                            style={{ backgroundImage: `url(${artist.profileImage ?? ''})` }}
                          />
                          <span className={eventArtistName}>{artist.name || 'Unknown Artist'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className={eventDetails}>
                  <div className={eventDetailItem}>
                    <CalendarIcon
                      aria-hidden="true"
                      style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '4px' }}
                    />
                    <span className={detailText}>{eventDateText}</span>
                  </div>

                  {event.location.name && (
                    <div className={eventDetailItem}>
                      <MapPinIcon
                        aria-hidden="true"
                        style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '4px' }}
                      />
                      <span className={detailText}>{event.location.name}</span>
                    </div>
                  )}
                </div>

                {submissionTime && isShowSubmissionInfo && (
                  <div className={styledSubmissionTime}>投稿時間：{submissionTime}</div>
                )}
              </div>
            </div>
          </Link>

          {actionButtons && <div className={buttonContainer}>{actionButtons}</div>}
        </div>
      )}
      {event.status !== 'approved' && (
        <div className={verticalEventCardContainer}>
          <div
            className={eventImageStyle}
            style={{ backgroundImage: `url(${event.mainImage ?? ''})` }}
          >
            {isShowSubmissionInfo && (
              <span className={statusBadge({ status: event.status })}>
                {getStatusText(event.status, event.rejectedReason)}
              </span>
            )}

            <div className={imageOverlay({ isApproved: false })}>
              <h3 className={eventTitle}>{event.title}</h3>

              {event.artists && event.artists.length > 0 && (
                <div className={eventArtistSection}>
                  {event.artists.map((artist, index) => (
                    <div key={artist.id || index} style={{ display: 'flex', alignItems: 'center' }}>
                      {index > 0 && <span className={eventArtistSeparator}>/</span>}
                      <div className={eventArtistItem}>
                        <div
                          className={eventArtistAvatar}
                          style={{ backgroundImage: `url(${artist.profileImage ?? ''})` }}
                        />
                        <span className={eventArtistName}>{artist.name || 'Unknown Artist'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className={eventDetails}>
                <div className={eventDetailItem}>
                  <CalendarIcon
                    aria-hidden="true"
                    style={{ width: '16px', height: '16px', flexShrink: 0 }}
                  />
                  <span className={detailText}>{eventDateText}</span>
                </div>

                {event.location.name && (
                  <div className={eventDetailItem}>
                    <MapPinIcon
                      aria-hidden="true"
                      style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '4px' }}
                    />
                    <span className={detailText}>{event.location.name}</span>
                  </div>
                )}
              </div>

              {submissionTime && isShowSubmissionInfo && (
                <div className={styledSubmissionTime}>投稿時間：{submissionTime}</div>
              )}
            </div>
          </div>

          {actionButtons && <div className={buttonContainer}>{actionButtons}</div>}
        </div>
      )}
    </>
  );
};

export default VerticalEventCard;
