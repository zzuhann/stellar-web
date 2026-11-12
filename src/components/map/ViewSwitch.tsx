'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { css, cx } from '@/styled-system/css';

const inlineNav = css({
  display: 'flex',
  justifyContent: 'center',
});

// Above the map (.leaflet-container is z-index 1 in globals.css), below the bottom sheet and locate button (10)
const floatingNav = css({
  position: 'absolute',
  top: '82px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: '5',
});

const group = css({
  position: 'relative',
  display: 'inline-grid',
  gridTemplateColumns: '1fr 1fr',
  padding: '0.5',
  borderRadius: 'radius.lg',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.secondary',
});

const floatingGroup = css({
  background: 'alpha.white.90',
  boxShadow: 'shadow.md',
});

// Slides between the two equal-width columns
const indicator = css({
  position: 'absolute',
  top: '0.5',
  bottom: '0.5',
  left: '0.5',
  width: 'calc(50% - 2px)',
  borderRadius: 'radius.md',
  background: 'color.primary',
  transition: 'transform 0.25s ease',
  '&[data-active="overview"]': { transform: 'translateX(100%)' },
  _motionReduce: { transition: 'none' },
});

const item = css({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1',
  // 32px still clears the WCAG 2.2 AA 24px target size
  minHeight: '32px',
  paddingX: '3',
  textStyle: 'button',
  fontSize: '13px',
  textDecoration: 'none',
  color: 'color.text.primary',
  transition: 'color 0.25s ease',
  '&[data-active="true"]': { color: 'color.background.primary' },
  _motionReduce: { transition: 'none' },
});

type View = 'map' | 'overview';

const VIEWS: { view: View; label: string; Icon: typeof MapIcon }[] = [
  { view: 'map', label: '地圖', Icon: MapIcon },
  { view: 'overview', label: '總覽', Icon: Squares2X2Icon },
];

interface ViewSwitchProps {
  // Route param (slug, or id when the artist has no slug)
  artistId: string;
  current: View;
  floating?: boolean;
}

// Plain links on purpose: Header back-button depth lives in memory and a full reload would reset it
export default function ViewSwitch({ artistId, current, floating = false }: ViewSwitchProps) {
  // Moves the indicator on tap, before the next page finishes loading
  const [active, setActive] = useState<View>(current);

  return (
    <nav aria-label="切換檢視" className={floating ? floatingNav : inlineNav}>
      <div className={cx(group, floating && floatingGroup)}>
        <span className={indicator} data-active={active} aria-hidden="true" />
        {VIEWS.map(({ view, label, Icon }) => (
          <Link
            key={view}
            href={view === 'map' ? `/map/${artistId}` : `/map/${artistId}/overview`}
            prefetch={false}
            className={item}
            aria-current={current === view ? 'page' : undefined}
            data-active={active === view}
            // onNavigate skips ⌘/Ctrl-click new tabs, which would leave this page's indicator on the wrong side
            onNavigate={() => setActive(view)}
          >
            <Icon width={16} height={16} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
