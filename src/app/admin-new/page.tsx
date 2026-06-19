import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
  paddingX: '4',
  paddingY: '10',
});

const inner = css({
  maxWidth: '400px',
  margin: '0 auto',
});

const heading = css({
  textStyle: 'h2',
  color: 'color.text.primary',
  marginBottom: '8',
  textAlign: 'center',
});

const buttonList = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
});

const navButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  height: '56px',
  paddingX: '5',
  borderRadius: 'radius.lg',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'body',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
  '&:hover': {
    background: 'color.background.secondary',
  },
});

const disabledButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  height: '56px',
  paddingX: '5',
  borderRadius: 'radius.lg',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  color: 'color.text.disabled',
  textStyle: 'body',
  cursor: 'not-allowed',
});

const buttonLeft = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
});

const comingSoonBadge = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  background: 'color.background.secondary',
  paddingX: '2',
  paddingY: '0.5',
  borderRadius: 'radius.sm',
});

const chevron = css({
  width: '16px',
  height: '16px',
  color: 'color.text.secondary',
  flexShrink: 0,
});

const MENU_ITEMS = [
  { label: '活動', href: '/admin-new/events', enabled: true },
  { label: '藝人', href: '/admin-new/artists', enabled: true },
  { label: '待審核', href: '/admin-new/review', enabled: false },
  { label: '場地管理', href: '/admin-new/venues', enabled: false },
];

export default function AdminNewPage() {
  return (
    <div className={pageContainer}>
      <div className={inner}>
        <h1 className={heading}>管理後台</h1>
        <nav className={buttonList} aria-label="管理後台功能選單">
          {MENU_ITEMS.map((item) =>
            item.enabled ? (
              <Link key={item.href} href={item.href} className={navButton}>
                <span className={buttonLeft}>{item.label}</span>
                <ChevronRightIcon className={chevron} aria-hidden="true" />
              </Link>
            ) : (
              <button key={item.href} className={disabledButton} disabled aria-disabled="true">
                <span className={buttonLeft}>{item.label}</span>
                <span className={comingSoonBadge}>即將推出</span>
              </button>
            )
          )}
        </nav>
      </div>
    </div>
  );
}
