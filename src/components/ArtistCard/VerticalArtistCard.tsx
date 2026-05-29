import { Artist } from '@/types';
import { css, cva } from '@/styled-system/css';
import { FirebaseTimestamp } from '@/types';
import { formatBirthdayFull } from '@/utils/birthdayHelpers';
import Image from 'next/image';

const verticalArtistCardContainer = css({
  display: 'flex',
  flexDirection: 'column',
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
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
    gap: '1',
    // button reset：移除預設樣式，視覺與 div 一致
    appearance: 'none',
    border: 'none',
    margin: 0,
    font: 'inherit',
    textAlign: 'left',
    width: '100%',

    '&:disabled': {
      cursor: 'default',
      opacity: 1,
    },
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
  gap: '2',
  minHeight: '60px',
});

const artistName = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'white',
  margin: '0',
});

const artistBirthday = css({
  textStyle: 'bodySmall',
  color: 'alpha.white.80',
  display: 'flex',
  alignItems: 'center',
  gap: '1',
});

const styledSubmissionTime = css({
  textStyle: 'caption',
  color: 'alpha.white.70',
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
      exists: {
        background: 'stellarBlue.50',
        color: 'stellarBlue.700',
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

const getStatusText = (status: 'pending' | 'approved' | 'rejected' | 'exists') => {
  switch (status) {
    case 'approved':
      return '已通過';
    case 'rejected':
      return '未通過';
    case 'exists':
      return '已存在';
    case 'pending':
    default:
      return '審核中';
  }
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
  const birthdayText = formatBirthdayFull(artist.birthday ?? '');

  return (
    <div className={verticalArtistCardContainer}>
      <div className={artistImage}>
        {artist.profileImage && (
          <Image
            src={artist.profileImage}
            alt={artist.stageName}
            fill
            sizes="(max-width: 600px) 50vw, 200px"
            style={{ objectFit: 'cover' }}
          />
        )}
        {artist.status && (
          <span
            className={statusBadge({ status: artist.status })}
            aria-label={`${artist.stageName} 的審核狀態`}
          >
            {getStatusText(artist.status)}
          </span>
        )}

        <button
          type="button"
          className={imageOverlay({
            isExists: artist.status === 'exists' || artist.status === 'approved',
          })}
          aria-label={`前往 ${artist.stageName} 的生日應援地圖頁面`}
          disabled={artist.status !== 'approved' && artist.status !== 'exists'}
          onClick={() => {
            if (artist.status === 'approved' || artist.status === 'exists') {
              onClick?.(artist);
            }
          }}
        >
          <h3 className={artistName}>
            {artist.stageName.toUpperCase()} {artist.realName}
          </h3>

          {birthdayText && (
            <div className={artistBirthday}>
              <span aria-label="生日">🎂</span> {birthdayText}
            </div>
          )}

          {submissionTime && <div className={styledSubmissionTime}>投稿時間：{submissionTime}</div>}
        </button>
      </div>

      {actionButtons && <div className={buttonContainer}>{actionButtons}</div>}
    </div>
  );
};

export default VerticalArtistCard;
