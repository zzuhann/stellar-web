import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { STELLAR_INSTAGRAM_URL } from '@/constants/stellarSocial';

const notice = css({
  marginX: '4',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '2',
  paddingY: '1',
  paddingX: '3',
  borderRadius: 'radius.lg',
  border: '1px solid',
  borderColor: 'color.info.border',
  background: 'color.info.background',
  color: 'color.info.text',
  textStyle: 'bodySmall',
  lg: { textStyle: 'body' },
});

const icon = css({
  flexShrink: 0,
  marginTop: '3',
});

const text = css({
  margin: 0,
  paddingY: '2',
});

const link = css({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '44px',
  color: 'color.info.text',
  fontWeight: 'semibold',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.info.text',
    outlineOffset: '2px',
    borderRadius: 'radius.sm',
  },
});

export default function VenuePreviewNotice() {
  return (
    <div role="note" className={notice}>
      <InformationCircleIcon width={20} height={20} aria-hidden="true" className={icon} />
      <p className={text}>
        這是新版場地頁的預覽，還沒有公開。標籤或條件跟你們的規定不一樣的話，私訊{' '}
        <a href={STELLAR_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={link}>
          STELLAR IG
          <span className="sr-only">（開新分頁）</span>
        </a>{' '}
        告訴我們。
      </p>
    </div>
  );
}
