import { css } from '@/styled-system/css';
import type { VenueContact } from '@/utils/venueContact';
import VenueContactActions from './VenueContactActions';

// Literal heights for Panda's static extraction: 1px border + 12px + 48px button + 12px = 73px; +44px form line

const bar = css({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 40,
  paddingTop: '12px',
  paddingX: '4',
  paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
  background: 'color.background.primary',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  lg: { display: 'none' },
});

const inner = css({
  maxWidth: '640px',
  marginX: 'auto',
});

// Same height as the bar so the last line of the page never sits underneath it
const spacer = css({
  height: 'calc(73px + env(safe-area-inset-bottom))',
  '&[data-booking-form="true"]': {
    height: 'calc(117px + env(safe-area-inset-bottom))',
  },
  lg: { display: 'none' },
});

interface VenueContactBarProps {
  contact: VenueContact;
  onClickContact?: (contactType: string) => void;
}

export function VenueContactBarSpacer({ contact }: { contact: VenueContact }) {
  return (
    <div
      aria-hidden="true"
      data-testid="contact-bar-spacer"
      data-booking-form={contact.bookingFormUrl ? 'true' : 'false'}
      className={spacer}
    />
  );
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
