import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import { formatTagDate } from '@/utils/venueTags';
import { externalIcon, textLink } from './styles';

const row = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: '3',
  rowGap: '0',
});

const links = css({
  display: 'flex',
  flexWrap: 'wrap',
  columnGap: '3',
  textStyle: 'bodySmall',
});

const date = css({
  marginLeft: 'auto',
  textStyle: 'caption',
  color: 'color.text.secondary',
  fontVariantNumeric: 'tabular-nums',
});

interface VenueSourceMetaProps {
  sourceLinks: string[];
  infoUpdatedOn: string | null;
}

export default function VenueSourceMeta({ sourceLinks, infoUpdatedOn }: VenueSourceMetaProps) {
  if (sourceLinks.length === 0 && !infoUpdatedOn) return null;

  return (
    <div className={row}>
      {sourceLinks.length > 0 && (
        <div className={links}>
          {sourceLinks.map((href, i) => (
            <a
              key={`${i}-${href}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={textLink}
            >
              {sourceLinks.length > 1 ? `店家原始說明 ${i + 1}` : '店家原始說明'}
              <ArrowTopRightOnSquareIcon
                width={14}
                height={14}
                aria-hidden="true"
                className={externalIcon}
              />
              <span className="sr-only">（開新分頁）</span>
            </a>
          ))}
        </div>
      )}
      {infoUpdatedOn && <span className={date}>資料更新於 {formatTagDate(infoUpdatedOn)}</span>}
    </div>
  );
}
