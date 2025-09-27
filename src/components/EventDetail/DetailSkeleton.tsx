import { css } from '@/styled-system/css';
import Skeleton from '../ui/Skeleton';

const pageContainer = css({
  minHeight: '100vh',
  backgroundColor: 'color.background.primary',
});

const mainContainer = css({
  maxWidth: '500px',
  margin: '0 auto',
  boxShadow: 'shadow.sm',
});

const bannerSkeleton = css({
  position: 'relative',
  width: '100%',
  aspectRatio: '3/4',
  marginBottom: '24px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
});

const contentSection = css({
  background: '#fff',
  padding: '0 20px 16px 20px',
  marginBottom: '24px',
});

const skeletonSpacing = css({
  marginBottom: '16px',
});

const skeletonSpacingLarge = css({
  marginBottom: '24px',
});

const DetailSkeleton = () => {
  return (
    <div className={pageContainer}>
      <div className={mainContainer}>
        {/* Banner Skeleton */}
        <div className={bannerSkeleton}>
          <Skeleton width="100%" height="100%" borderRadius="0" />
        </div>

        {/* Content Section */}
        <div className={contentSection}>
          {/* Title Skeleton */}
          <Skeleton width="80%" height="24px" className={skeletonSpacingLarge} />

          {/* Artist Section Skeleton */}
          <div className={skeletonSpacing}>
            <Skeleton width="60%" height="20px" />
          </div>

          {/* Social Media Section Skeleton */}
          <div className={skeletonSpacingLarge}>
            <Skeleton width="100%" height="16px" className={skeletonSpacing} />
            <Skeleton width="90%" height="16px" className={skeletonSpacing} />
            <Skeleton width="70%" height="16px" />
          </div>

          {/* Event Details Section Skeleton */}
          <div className={skeletonSpacingLarge}>
            <Skeleton width="100%" height="16px" className={skeletonSpacing} />
            <Skeleton width="85%" height="16px" className={skeletonSpacing} />
            <Skeleton width="95%" height="16px" />
          </div>

          {/* Description Section Skeleton */}
          <div className={skeletonSpacingLarge}>
            <Skeleton width="100%" height="16px" className={skeletonSpacing} />
            <Skeleton width="90%" height="16px" className={skeletonSpacing} />
            <Skeleton width="75%" height="16px" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailSkeleton;
