import { css } from '@/styled-system/css';
import { Artist } from '@/types';

const emptyStateContainer = css({
  textAlign: 'center',
  paddingY: '10',
  paddingX: '5',
  color: 'color.text.secondary',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4',
});

const emptyStateTitle = css({
  textStyle: 'h4',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  marginBottom: '2',
  marginTop: '0',
  marginX: '0',
});

const profileImageContainer = css({
  width: '80px',
  height: '80px',
  borderRadius: 'radius.circle',
  overflow: 'hidden',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
});

type EmptyStateProps = {
  artistData: Artist | null;
};

const EmptyState = ({ artistData }: EmptyStateProps) => {
  return (
    <div className={emptyStateContainer}>
      <div
        className={profileImageContainer}
        style={{ backgroundImage: `url(${artistData?.profileImage || ''})` }}
      />
      <h3 className={emptyStateTitle}>目前沒有 {artistData?.stageName} 的生日應援</h3>
    </div>
  );
};

export default EmptyState;
