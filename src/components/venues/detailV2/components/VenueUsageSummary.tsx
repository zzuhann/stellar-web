import { useId } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { css, cx } from '@/styled-system/css';
import type { VenueUsageRow } from '@/utils/venueTags';
import VenueSourceMeta from './VenueSourceMeta';

const card = css({
  marginX: '4',
  padding: '4',
  borderRadius: 'radius.lg',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
});

const title = css({
  margin: 0,
  textStyle: 'caption',
  fontWeight: 'bold',
  color: 'color.text.secondary',
  lg: { textStyle: 'bodySmall', fontWeight: 'bold' },
});

const list = css({
  listStyle: 'none',
  margin: 0,
  marginTop: '3',
  padding: 0,
  display: 'grid',
  gap: '3',
  lg: { gridTemplateColumns: '1fr 1fr', columnGap: '6' },
});

const item = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '3',
});

const fullRow = css({
  lg: { gridColumn: '1 / -1' },
});

const checkDot = css({
  flexShrink: 0,
  width: '24px',
  height: '24px',
  borderRadius: 'radius.circle',
  background: 'stellarBlue.50',
  color: 'stellarBlue.700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const rowTitle = css({
  margin: 0,
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  lg: { textStyle: 'h4', fontWeight: 'semibold' },
});

const rowDesc = css({
  margin: 0,
  marginTop: '0.5',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  lg: { textStyle: 'body' },
});

const rowCondition = css({
  margin: 0,
  marginTop: '0.5',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'stellarBlue.700',
  lg: { textStyle: 'body', fontWeight: 'semibold' },
});

const notes = css({
  marginTop: '4',
  paddingTop: '3',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
});

const note = css({
  margin: 0,
  textStyle: 'caption',
  color: 'color.text.secondary',
  lg: { textStyle: 'bodySmall' },
});

interface VenueUsageSummaryProps {
  rows: VenueUsageRow[];
  sourceLinks: string[];
  infoUpdatedOn: string | null;
}

export default function VenueUsageSummary({
  rows,
  sourceLinks,
  infoUpdatedOn,
}: VenueUsageSummaryProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={card}>
      <h2 id={headingId} className={title}>
        可以在這裡
      </h2>
      <ul className={list}>
        {rows.map((row) => (
          <li key={row.key} className={cx(item, row.key === 'decorate' && fullRow)}>
            <span className={checkDot} aria-hidden="true">
              <CheckIcon width={14} height={14} strokeWidth={2.5} />
            </span>
            <div>
              <p className={rowTitle}>{row.title}</p>
              {row.description && (
                <p className={row.isCondition ? rowCondition : rowDesc}>{row.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className={notes}>
        <p className={note}>沒列出的不代表不行，可以直接問店家。</p>
        <p className={note}>費用依方案而定，以店家最新說明、私訊討論為準。</p>
        <VenueSourceMeta sourceLinks={sourceLinks} infoUpdatedOn={infoUpdatedOn} />
      </div>
    </section>
  );
}
