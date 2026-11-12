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
  display: 'inline-flex',
  padding: '0.5',
  gap: '0.5',
  borderRadius: 'radius.lg',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.secondary',
});

const floatingGroup = css({
  background: 'alpha.white.90',
  boxShadow: 'shadow.md',
});

const item = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1.5',
  minHeight: '44px',
  paddingX: '4',
  borderRadius: 'radius.md',
  textStyle: 'button',
  textDecoration: 'none',
  color: 'color.text.primary',
  background: 'transparent',
  '&[aria-current="page"]': {
    background: 'color.primary',
    color: 'color.background.primary',
  },
});

interface ViewSwitchProps {
  // Route param (slug, or id when the artist has no slug)
  artistId: string;
  current: 'map' | 'overview';
  floating?: boolean;
}

// Plain links on purpose: Header back-button depth lives in memory and a full reload would reset it
export default function ViewSwitch({ artistId, current, floating = false }: ViewSwitchProps) {
  return (
    <nav aria-label="切換檢視" className={floating ? floatingNav : inlineNav}>
      <div className={cx(group, floating && floatingGroup)}>
        <Link
          href={`/map/${artistId}`}
          prefetch={false}
          className={item}
          aria-current={current === 'map' ? 'page' : undefined}
        >
          <MapIcon width={18} height={18} aria-hidden="true" />
          地圖
        </Link>
        <Link
          href={`/map/${artistId}/overview`}
          prefetch={false}
          className={item}
          aria-current={current === 'overview' ? 'page' : undefined}
        >
          <Squares2X2Icon width={18} height={18} aria-hidden="true" />
          總覽
        </Link>
      </div>
    </nav>
  );
}
