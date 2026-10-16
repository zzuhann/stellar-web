import { useId } from 'react';
import { css } from '@/styled-system/css';
import type { VenueFacilityRow } from '@/utils/venueTags';
import { sectionTitle, tag } from './styles';

const section = css({
  paddingX: '4',
});

const layout = css({
  marginTop: '3',
  display: 'grid',
  gap: '4',
  lg: { gridTemplateColumns: '1fr 1fr', gap: '6', alignItems: 'start' },
});

const list = css({
  margin: 0,
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  columnGap: '3',
  rowGap: '2.5',
  alignItems: 'baseline',
});

const rowWrap = css({ display: 'contents' });

const term = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  whiteSpace: 'nowrap',
});

const tagGroup = css({
  margin: 0,
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.5',
});

const equipmentBox = css({
  padding: '4',
  borderRadius: 'radius.lg',
  background: 'gray.50',
});

const equipmentTitle = css({
  margin: 0,
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
});

const equipmentText = css({
  margin: 0,
  marginTop: '2',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
});

const equipmentHint = css({
  margin: 0,
  marginTop: '2',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

interface EquipmentNoteProps {
  note: string;
  headingLevel: 'h2' | 'h3';
}

function EquipmentNote({ note, headingLevel: Heading }: EquipmentNoteProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={equipmentBox}>
      <Heading id={headingId} className={equipmentTitle}>
        店家提供的設備
      </Heading>
      <p className={equipmentText}>{note}</p>
      <p className={equipmentHint}>部分需租借，以店家說明為準。</p>
    </section>
  );
}

interface VenueFacilitiesProps {
  rows: VenueFacilityRow[];
  equipmentNote: string;
}

export default function VenueFacilities({ rows, equipmentNote }: VenueFacilitiesProps) {
  const headingId = useId();
  const note = equipmentNote.trim();

  // Tag rows hidden (no tags or dictionary failed): the equipment text still shows on its own
  if (rows.length === 0) {
    return note ? (
      <div className={section}>
        <EquipmentNote note={note} headingLevel="h2" />
      </div>
    ) : null;
  }

  return (
    <section aria-labelledby={headingId} className={section}>
      <h2 id={headingId} className={sectionTitle}>
        服務、交通與空間
      </h2>
      <div className={layout}>
        <dl className={list}>
          {rows.map((row) => (
            <div key={row.key} className={rowWrap}>
              <dt className={term}>{row.label}</dt>
              <dd className={tagGroup}>
                {row.tags.map((t) => (
                  <span key={t.slug} className={tag}>
                    {t.label}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
        {note && <EquipmentNote note={note} headingLevel="h3" />}
      </div>
    </section>
  );
}
