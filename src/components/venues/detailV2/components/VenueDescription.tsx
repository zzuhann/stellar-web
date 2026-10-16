import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { css, cx } from '@/styled-system/css';
import { sectionTitle } from './styles';

const section = css({
  paddingX: '4',
});

const metaWrap = css({
  marginTop: '1',
});

const text = css({
  margin: 0,
  marginTop: '2',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  lineHeight: 1.7,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  lg: { textStyle: 'body' },
});

// Mobile shows 4 lines; desktop always shows the full text
const clamped = css({
  lineClamp: 4,
  lg: { lineClamp: 'none', display: 'block', overflow: 'visible' },
});

const toggle = css({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '44px',
  padding: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  textStyle: 'button',
  color: 'color.link',
  '&:hover': { color: 'color.linkHover' },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
    borderRadius: 'radius.sm',
  },
  lg: { display: 'none' },
});

interface VenueDescriptionProps {
  description: string;
  // Source links and date land here when the usage summary is not shown
  meta?: ReactNode;
}

export default function VenueDescription({ description, meta }: VenueDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const headingId = useId();
  const textId = useId();

  useEffect(() => {
    const el = textRef.current;
    // Measure only while clamped; once expanded the toggle must stay to allow collapsing
    if (!el || expanded) return;
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [description, expanded]);

  if (!description && !meta) return null;

  return (
    <section aria-labelledby={headingId} className={section}>
      <h2 id={headingId} className={sectionTitle}>
        店家說明
      </h2>
      {meta && <div className={metaWrap}>{meta}</div>}
      {description && (
        <>
          <p ref={textRef} id={textId} className={cx(text, !expanded && clamped)}>
            {description}
          </p>
          {(overflowing || expanded) && (
            <button
              type="button"
              className={toggle}
              aria-expanded={expanded}
              aria-controls={textId}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? '收合' : '展開全部'}
            </button>
          )}
        </>
      )}
    </section>
  );
}
