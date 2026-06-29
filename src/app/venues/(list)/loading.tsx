import { css } from '@/styled-system/css';
import VenueCardSkeleton from '@/components/venues/VenueCardSkeleton';
import Skeleton from '@/components/ui/Skeleton';

const page = css({
  minHeight: '100vh',
  background: 'color.background.primary',
  paddingTop: '70px',
});

const inner = css({
  maxWidth: '500px',
  margin: '0 auto',
  boxShadow: 'shadow.md',
});

const heroSection = css({
  paddingTop: '4',
  paddingX: '4',
  paddingBottom: '3',
  background: 'color.background.primary',
});

const title = css({
  marginTop: '0.5',
  marginX: '0',
  marginBottom: '1.5',
  textStyle: 'h3',
  fontWeight: 'bold',
  color: 'color.text.primary',
});

const subtitle = css({
  margin: 0,
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const filterBar = css({
  background: 'color.background.primary',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  paddingY: '2.5',
  paddingX: '4',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

const listSection = css({
  padding: '4',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

export default function VenuesLoading() {
  return (
    <div className={page}>
      <div className={inner}>
        <section className={heroSection}>
          <h1 className={title}>生咖、生日應援場地列表</h1>
          <p className={subtitle}>在 STELLAR 找到適合舉辦生咖、生日應援的空間！</p>
        </section>

        <div className={filterBar}>
          <Skeleton width="100%" height="32px" borderRadius="20px" />
          <Skeleton width="60%" height="32px" borderRadius="20px" />
        </div>

        <section className={listSection}>
          {Array.from({ length: 6 }, (_, i) => (
            <VenueCardSkeleton key={i} />
          ))}
        </section>
      </div>
    </div>
  );
}
