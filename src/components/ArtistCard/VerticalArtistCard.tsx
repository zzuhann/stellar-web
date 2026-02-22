import { Artist } from '@/types';
import { css, cva } from '@/styled-system/css';
import { FirebaseTimestamp } from '@/types';

const verticalArtistCardContainer = css({
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
  height: '360px',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: 'shadow.md',
  },
});

const artistImage = css({
  width: '100%',
  height: '100%',
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
    gap: '4px',
  },
  variants: {
    isExists: {
      true: {
        cursor: 'pointer',
      },
      false: {
        cursor: 'default',
      },
    },
  },
});

const buttonContainer = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minHeight: '60px',
});

const artistName = css({
  fontSize: '14px',
  fontWeight: '600',
  color: 'white',
  margin: '0',
});

const artistBirthday = css({
  fontSize: '14px',
  color: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const styledSubmissionTime = css({
  fontSize: '12px',
  color: 'rgba(255, 255, 255, 0.7)',
});

const statusBadge = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    padding: '6px 8px',
    borderRadius: 'radius.md',
    fontSize: '14px',
    fontWeight: '600',
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
      exists: {
        background: '#e0e7ff',
        color: '#3730a3',
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

const getStatusText = (
  status: 'pending' | 'approved' | 'rejected' | 'exists',
  rejectedReason?: string
) => {
  switch (status) {
    case 'approved':
      return '已通過';
    case 'rejected':
      return `未通過：${rejectedReason}`;
    case 'exists':
      return '已存在';
    case 'pending':
    default:
      return '審核中';
  }
};

const getBirthdayText = (birthday: string): string => {
  if (!birthday) return '';
  const date = new Date(birthday);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

interface VerticalArtistCardProps {
  artist: Artist & {
    status?: 'pending' | 'approved' | 'rejected' | 'exists';
    rejectedReason?: string;
    createdAt?: string | FirebaseTimestamp;
  };
  onClick?: (artist: Artist) => void;
  actionButtons?: React.ReactElement;
  submissionTime?: string;
}

const VerticalArtistCard = ({
  artist,
  onClick,
  actionButtons,
  submissionTime,
}: VerticalArtistCardProps) => {
  const birthdayText = getBirthdayText(artist.birthday ?? '');

  return (
    <div className={verticalArtistCardContainer}>
      <div
        className={artistImage}
        style={{
          backgroundImage: artist.profileImage ? `url(${artist.profileImage})` : undefined,
        }}
      >
        {artist.status && (
          <span className={statusBadge({ status: artist.status })}>
            {getStatusText(artist.status, artist.rejectedReason)}
          </span>
        )}

        <div
          className={imageOverlay({
            isExists: artist.status === 'exists' || artist.status === 'approved',
          })}
          onClick={() => {
            if (artist.status === 'approved' || artist.status === 'exists') {
              onClick?.(artist);
            }
          }}
        >
          <h3 className={artistName}>
            {artist.stageName.toUpperCase()} {artist.realName}
          </h3>

          {birthdayText && <div className={artistBirthday}>🎂 {birthdayText}</div>}

          {submissionTime && <div className={styledSubmissionTime}>投稿時間：{submissionTime}</div>}
        </div>
      </div>

      {actionButtons && <div className={buttonContainer}>{actionButtons}</div>}
    </div>
  );
};

export default VerticalArtistCard;
