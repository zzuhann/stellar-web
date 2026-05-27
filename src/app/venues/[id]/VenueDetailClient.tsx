import { css } from '@/styled-system/css';
import type { VenueDetail } from '@/types';
import VenueDetailView from '@/components/venues/VenueDetailView';

const notFoundWrap = css({
  minHeight: '60vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '40px 20px',
  textAlign: 'center',
});

const notFoundTitle = css({
  fontSize: '18px',
  fontWeight: 700,
  color: 'color.text.primary',
  margin: 0,
});

const notFoundDesc = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  margin: 0,
});

interface VenueDetailClientProps {
  venue: VenueDetail | null;
}

export default function VenueDetailClient({ venue }: VenueDetailClientProps) {
  if (!venue) {
    return (
      <div className={notFoundWrap}>
        <h1 className={notFoundTitle}>找不到此場地</h1>
        <p className={notFoundDesc}>該場地可能已下架或不存在。</p>
      </div>
    );
  }

  return <VenueDetailView venue={venue} />;
}
