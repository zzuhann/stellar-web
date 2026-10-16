import { useId } from 'react';
import { css } from '@/styled-system/css';
import type { VenueContact } from '@/utils/venueContact';
import VenueContactActions from './VenueContactActions';

const card = css({
  position: 'sticky',
  // Clears the 70px fixed site header
  top: 'calc(70px + token(spacing.6))',
  zIndex: 1,
  padding: '5',
  borderRadius: 'radius.xl',
  background: 'color.background.primary',
  boxShadow: 'shadow.md',
});

const title = css({
  margin: 0,
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
});

const desc = css({
  margin: 0,
  marginTop: '1',
  marginBottom: '4',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const descOnly = css({
  margin: 0,
  marginTop: '1',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

interface VenueContactCardProps {
  contact: VenueContact | null;
  onClickContact?: (contactType: string) => void;
}

export default function VenueContactCard({ contact, onClickContact }: VenueContactCardProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={card}>
      <h2 id={headingId} className={title}>
        想在這裡辦？
      </h2>
      {contact ? (
        <>
          <p className={desc}>STELLAR 不經手預約。先看店家的預約說明，再私訊確認檔期與方案。</p>
          <VenueContactActions contact={contact} align="start" onClickContact={onClickContact} />
        </>
      ) : (
        <p className={descOnly}>這家還沒提供聯絡方式，可以先看店家原始說明。</p>
      )}
    </section>
  );
}
