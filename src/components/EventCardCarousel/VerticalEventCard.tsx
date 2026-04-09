import { CoffeeEvent } from '@/types';
import { css, cva } from '@/styled-system/css';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Skeleton from '@/components/ui/Skeleton';

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
    padding: '4',
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

const eventTitle = css({
  textStyle: 'bodyStrong',
  color: 'white',
  marginTop: '0',
  marginX: '0',
  marginBottom: '2',
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  lineClamp: 2,
});

const statusBadge = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5',
    paddingY: '1.5',
    paddingX: '2',
    borderRadius: 'radius.md',
    textStyle: 'bodySmall',
    fontWeight: 'semibold',
    position: 'absolute',
    top: '1.5',
    right: '1.5',
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

const eventArtistSection = css({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1',
  textStyle: 'bodySmall',
  color: 'alpha.white.90',
  marginBottom: '2',
});

const eventArtistItem = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
});

const eventArtistAvatar = css({
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

const eventArtistName = css({
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  color: 'alpha.white.90',
});

const eventArtistSeparator = css({
  textStyle: 'bodySmall',
  color: 'alpha.white.70',
  marginY: '0',
  marginX: '0.5',
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

export function VerticalEventCardSkeleton() {
  return (
    <div className={verticalEventCardContainer}>
      <Skeleton width="100%" height="auto" borderRadius="0" style={{ aspectRatio: '3/4' }} />
    </div>
  );
}

interface VerticalEventCardProps {
  event: CoffeeEvent;
}

const VerticalEventCard = ({ event }: VerticalEventCardProps) => {
  const pathname = usePathname();
  const isShowSubmissionInfo = pathname !== '/' && pathname !== '/my-favorite';

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
              </div>
            </div>
          </Link>
        </div>
      )}
    </>
  );
};

export default VerticalEventCard;
