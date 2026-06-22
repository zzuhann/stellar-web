'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cva, css } from '@/styled-system/css';

const sidebar = css({
  display: 'none',
  width: '200px',
  flexShrink: 0,
  borderRight: '1px solid',
  borderRightColor: 'color.border.light',
  background: 'gray.50',
  flexDirection: 'column',
  md: {
    display: 'flex',
  },
});

const sidebarTitle = css({
  display: 'block',
  paddingX: '5',
  paddingY: '5',
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  textDecoration: 'none',
  '&:hover': {
    color: 'color.primary',
  },
});

const sidebarNav = css({
  display: 'flex',
  flexDirection: 'column',
  paddingY: '2',
});

const sidebarItem = cva({
  base: {
    display: 'block',
    paddingX: '5',
    paddingY: '2.5',
    textStyle: 'bodySmall',
    color: 'color.text.primary',
    textDecoration: 'none',
    transition: 'background 0.15s ease',
    borderLeft: '3px solid transparent',
    '&:hover': {
      background: 'gray.100',
    },
  },
  variants: {
    active: {
      true: {
        background: 'stellarBlue.50',
        borderLeftColor: 'stellarBlue.500',
        color: 'stellarBlue.500',
        fontWeight: 'semibold',
      },
    },
    disabled: {
      true: {
        color: 'color.text.disabled',
        cursor: 'not-allowed',
        '&:hover': {
          background: 'transparent',
        },
      },
    },
  },
});

const NAV_ITEMS = [
  { label: '活動', href: '/admin-new/events', disabled: false },
  { label: '藝人', href: '/admin-new/artists', disabled: false },
  { label: '待審核', href: '#', disabled: true },
  { label: '場地', href: '#', disabled: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={sidebar} aria-label="管理後台導航">
      <Link href="/admin-new" className={sidebarTitle}>
        管理後台
      </Link>
      <nav className={sidebarNav}>
        {NAV_ITEMS.map((item) =>
          item.disabled ? (
            <span key={item.label} className={sidebarItem({ disabled: true })} aria-disabled="true">
              {item.label}
            </span>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className={sidebarItem({ active: pathname.startsWith(item.href) })}
              aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          )
        )}
      </nav>
    </aside>
  );
}
