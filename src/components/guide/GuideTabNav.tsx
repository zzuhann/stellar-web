'use client';

import { useRef, useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import { css } from '@/styled-system/css';
import { GuideSection } from '@/data/guide';

const navContainer = css({
  position: 'relative',
  display: 'flex',
  gap: '2',
  marginBottom: '10',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
});

const tabBase = css({
  textStyle: 'body',
  fontWeight: 'medium',
  paddingX: '4',
  paddingY: '3',
  color: 'color.text.secondary',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
    borderRadius: 'radius.sm',
  },
});

const tabActive = css({
  color: 'color.primary',
  fontWeight: 'semibold',
});

const indicator = css({
  position: 'absolute',
  bottom: '-1px',
  height: '2px',
  background: 'color.primary',
  transition: 'left 0.25s ease, width 0.25s ease',
  borderRadius: '1px',
});

type Props = {
  sections: Pick<GuideSection, 'id' | 'label'>[];
  activeId: string;
};

const GuideTabNav = ({ sections, activeId }: Props) => {
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const activeIndex = sections.findIndex((s) => s.id === activeId);
    const el = tabRefs.current[activeIndex];
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeId, sections]);

  return (
    <nav aria-label="投稿方式分類">
      <div className={navContainer} role="tablist">
        {sections.map((section, i) => {
          const isActive = section.id === activeId;
          return (
            <Link
              key={section.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              href={`/guide?tab=${section.id}`}
              className={`${tabBase} ${isActive ? tabActive : ''}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${section.id}`}
              id={`tab-${section.id}`}
            >
              {section.label}
            </Link>
          );
        })}
        <span
          className={indicator}
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          aria-hidden="true"
        />
      </div>
    </nav>
  );
};

export default GuideTabNav;
