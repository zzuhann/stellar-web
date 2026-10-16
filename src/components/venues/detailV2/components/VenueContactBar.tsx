import { css } from '@/styled-system/css';
import type { VenueContact } from '@/utils/venueContact';
import VenueContactActions from './VenueContactActions';

// Sticky as the page's last block: it keeps its own flow space, so the last line is never covered
const bar = css({
  position: 'sticky',
  bottom: 0,
  zIndex: 40,
  paddingTop: '3',
  paddingX: '4',
  paddingBottom: 'calc(token(spacing.3) + env(safe-area-inset-bottom))',
  background: 'color.background.primary',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  lg: { display: 'none' },
});

const inner = css({
  maxWidth: '640px',
  marginX: 'auto',
});

interface VenueContactBarProps {
  contact: VenueContact;
  onClickContact?: (contactType: string) => void;
}

export default function VenueContactBar({ contact, onClickContact }: VenueContactBarProps) {
  return (
    <aside aria-label="聯絡店家" className={bar}>
      <div className={inner}>
        <VenueContactActions contact={contact} align="center" onClickContact={onClickContact} />
      </div>
    </aside>
  );
}
