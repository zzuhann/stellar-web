import { CoffeeEvent } from '@/types';
import { css, cva } from '@/styled-system/css';
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
      'linear-gradient(to top, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.1) 100%)',
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

const eventTitle = css({
  fontSize: '16px',
  fontWeight: 600,
  color: 'white',
  margin: '0 0 8px 0',
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
    gap: '2px',
    padding: '6px 8px',
    borderRadius: 'radius.md',
    fontSize: '16px',
    fontWeight: 600,
    position: 'absolute',
    top: '6px',
    right: '6px',
    zIndex: 1,
  },
  variants: {
    status: {
      approved: {
        background: '#dcfce7',
        color: '#166534',
      },
      rejected: {
        background: '#fee2e2',
        color: '#991b1b',
      },
      pending: {
        background: '#fef3c7',
        color: '#92400e',
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
              </div>
            </div>
          </Link>
        </div>
      )}
    </>
  );
};

export default VerticalEventCard;
