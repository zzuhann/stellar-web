import { css } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';

const pageOuter = css({
  minHeight: '100vh',
  background: 'color.background.primary',
  paddingTop: '70px',
});

const page = css({
  maxWidth: '500px',
  margin: '0 auto',
  background: 'color.background.primary',
  paddingBottom: '10',
  boxShadow: 'shadow.md',
});

const backBar = css({
  paddingTop: '3',
  paddingX: '4',
  paddingBottom: '2',
});

const titleSection = css({
  paddingTop: '3',
  paddingX: '4',
  paddingBottom: '1',
});

const statsGrid = css({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2',
  marginTop: '3',
});

const infoSection = css({
  paddingTop: '5',
  paddingX: '4',
  paddingBottom: '2',
});

const infoRowsWrap = css({
  marginTop: '3',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

export default function VenueDetailLoading() {
  return (
    <div className={pageOuter}>
      <div className={page}>
        <div className={backBar}>
          <Skeleton width="80px" height="16px" borderRadius="4px" />
        </div>

        <Skeleton width="100%" height="260px" borderRadius="0" />

        <section className={titleSection}>
          <Skeleton width="60%" height="24px" borderRadius="4px" />
          <div className={statsGrid}>
            <Skeleton height="72px" borderRadius="8px" />
            <Skeleton height="72px" borderRadius="8px" />
          </div>
        </section>

        <section className={infoSection}>
          <Skeleton width="60px" height="14px" borderRadius="4px" />
          <div className={infoRowsWrap}>
            <Skeleton width="80%" height="16px" borderRadius="4px" />
            <Skeleton width="65%" height="16px" borderRadius="4px" />
            <Skeleton width="50%" height="16px" borderRadius="4px" />
          </div>
        </section>
      </div>
    </div>
  );
}
