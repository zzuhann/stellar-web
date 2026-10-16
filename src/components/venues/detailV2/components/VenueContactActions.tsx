import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { css, cx } from '@/styled-system/css';
import type { VenueContact } from '@/utils/venueContact';
import { externalIcon, textLink } from './styles';

const primaryBtn = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minWidth: 0,
  minHeight: '48px',
  paddingX: '4',
  borderRadius: 'radius.md',
  background: 'color.primary',
  color: 'white',
  textStyle: 'button',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'background 0.15s ease',
  '&:hover': { background: 'color.primaryHover' },
  '&:active': { background: 'color.primaryActive' },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

const fixedPart = css({ flexShrink: 0 });

const namePart = css({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const formLine = css({
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  minHeight: '44px',
  textStyle: 'caption',
  color: 'color.text.secondary',
  whiteSpace: 'nowrap',
});

const formLineCenter = css({ justifyContent: 'center' });

interface VenueContactActionsProps {
  contact: VenueContact;
  align: 'center' | 'start';
  onClickContact?: (contactType: string) => void;
}

export default function VenueContactActions({
  contact,
  align,
  onClickContact,
}: VenueContactActionsProps) {
  const { labelParts } = contact;

  return (
    <>
      <a
        href={contact.url}
        target="_blank"
        rel="noopener noreferrer"
        className={primaryBtn}
        aria-label={`${labelParts.before}${labelParts.name}${labelParts.after}（開新分頁）`}
        onClick={() => onClickContact?.(contact.channel)}
      >
        <span data-part="prefix" className={fixedPart}>
          {labelParts.before}
        </span>
        <span data-part="name" className={namePart}>
          {labelParts.name}
        </span>
        {labelParts.after && (
          <span data-part="channel" className={fixedPart}>
            {labelParts.after}
          </span>
        )}
      </a>
      {contact.bookingFormUrl && (
        <p className={cx(formLine, align === 'center' && formLineCenter)}>
          <a
            href={contact.bookingFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={textLink}
            onClick={() => onClickContact?.('form')}
          >
            預約表單
            <ArrowTopRightOnSquareIcon
              width={12}
              height={12}
              aria-hidden="true"
              className={externalIcon}
            />
            <span className="sr-only">（開新分頁）</span>
          </a>
          <span>・填完記得私訊店家確認</span>
        </p>
      )}
    </>
  );
}
