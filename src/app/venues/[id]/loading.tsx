import { css } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';
import {
  areaAside,
  areaFacilities,
  areaHeader,
  areaPhotos,
  areaUsage,
  detailLayout,
  pageOuter,
  shell,
} from '@/components/venues/detailV2/layout';

// Same shell and grid as VenueDetailV2; block heights follow the real header, photos and cards

const breadcrumb = css({ paddingX: '4', paddingY: '2' });

const header = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  paddingX: '4',
});

const headerText = css({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

const inset = css({ marginX: '4' });

const photosMobile = css({ lg: { display: 'none' } });

const photosDesktop = css({
  display: 'none',
  lg: { display: 'block', marginX: '4' },
});

const lines = css({
  paddingX: '4',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

const contactCardDesktop = css({ display: 'none', lg: { display: 'block' } });

const contactBarMobile = css({
  position: 'sticky',
  bottom: 0,
  paddingTop: '3',
  paddingX: '4',
  paddingBottom: 'calc(token(spacing.3) + env(safe-area-inset-bottom))',
  background: 'color.background.primary',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  lg: { display: 'none' },
});

export default function VenueDetailLoading() {
  return (
    <main id="main-content" className={pageOuter} aria-busy="true">
      <div className={shell}>
        <div className={detailLayout}>
          <div className={areaHeader}>
            <div className={breadcrumb}>
              <Skeleton width="180px" height="20px" borderRadius="4px" />
            </div>
            <div className={header}>
              <Skeleton width="64px" height="64px" borderRadius="12px" />
              <div className={headerText}>
                <Skeleton width="60%" height="32px" borderRadius="6px" />
                <Skeleton width="45%" height="18px" borderRadius="4px" />
              </div>
            </div>
          </div>

          <div className={areaUsage}>
            <div className={inset}>
              <Skeleton width="100%" height="180px" borderRadius="12px" />
            </div>
          </div>

          <div className={areaPhotos}>
            <div className={photosMobile}>
              <Skeleton width="100%" height="240px" borderRadius="0" />
            </div>
            <div className={photosDesktop}>
              <Skeleton width="100%" height="400px" borderRadius="12px" />
            </div>
          </div>

          <div className={areaFacilities}>
            <div className={lines}>
              <Skeleton width="40%" height="18px" borderRadius="4px" />
              <Skeleton width="80%" height="16px" borderRadius="4px" />
              <Skeleton width="65%" height="16px" borderRadius="4px" />
            </div>
          </div>

          <div className={areaAside}>
            <div className={contactCardDesktop}>
              <Skeleton width="100%" height="220px" borderRadius="16px" />
            </div>
          </div>
        </div>
      </div>
      <div className={contactBarMobile}>
        <Skeleton width="100%" height="48px" borderRadius="8px" />
      </div>
    </main>
  );
}
