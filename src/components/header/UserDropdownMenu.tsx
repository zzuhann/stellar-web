import { css } from '@/styled-system/css';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRef, useEffect, useCallback } from 'react';

const container = css({
  position: 'relative',
});

const triggerButton = css({
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '0',
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
    borderRadius: 'radius.sm',
  },
});

const chevronIcon = css({
  transition: 'transform 0.2s ease',
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
});

const chevronIconOpen = css({
  transform: 'rotate(180deg)',
});

const menuPanel = css({
  position: 'absolute',
  right: '0',
  top: 'calc(100% + 8px)',
  minWidth: '140px',
  zIndex: 10,
  borderRadius: 'radius.md',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  boxShadow: 'shadow.lg',
  overflow: 'hidden',
});

const displayName = css({
  paddingY: '2',
  paddingX: '4',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  cursor: 'default',
  userSelect: 'none',
});

const menuItem = css({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  paddingY: '2',
  paddingX: '4',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'background 0.15s',
  '&:hover': {
    background: 'color.background.secondary',
  },
  '&:focus-visible': {
    outline: 'none',
    background: 'color.background.secondary',
    boxShadow: 'inset 3px 0 0 var(--colors-color-primary)',
  },
});

type UserDropdownMenuProps = {
  displayNameText: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSignOut: () => void;
};

const UserDropdownMenu = ({
  displayNameText,
  isOpen,
  onToggle,
  onClose,
  onSignOut,
}: UserDropdownMenuProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, onClose]);

  // 開啟後自動 focus 第一個 menuitem
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const first = menuRef.current.querySelector<HTMLElement>('[role="menuitem"]');
      first?.focus();
    }
  }, [isOpen]);

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]');
      if (!items?.length) return;
      const arr = Array.from(items);
      const idx = arr.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          arr[(idx + 1) % arr.length].focus();
          break;
        case 'ArrowUp':
          e.preventDefault();
          arr[(idx - 1 + arr.length) % arr.length].focus();
          break;
        case 'Home':
          e.preventDefault();
          arr[0].focus();
          break;
        case 'End':
          e.preventDefault();
          arr[arr.length - 1].focus();
          break;
        case 'Tab':
          onClose();
          break;
      }
    },
    [onClose]
  );

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !isOpen) {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div ref={containerRef} className={container}>
      <button
        ref={triggerRef}
        className={triggerButton}
        onClick={onToggle}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`會員專區，目前登入為 ${displayNameText}`}
        id="user-menu-trigger"
        type="button"
      >
        <span>會員專區</span>
        <ChevronDownIcon
          width={14}
          height={14}
          aria-hidden="true"
          className={`${chevronIcon} ${isOpen ? chevronIconOpen : ''}`}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={menuPanel}
          role="menu"
          aria-labelledby="user-menu-trigger"
          onKeyDown={handleMenuKeyDown}
        >
          <div className={displayName} aria-hidden="true">
            {displayNameText}
          </div>
          <Link href="/my-submissions" className={menuItem} role="menuitem" onClick={onClose}>
            我的投稿
          </Link>
          <Link href="/my-favorite" className={menuItem} role="menuitem" onClick={onClose}>
            我的收藏
          </Link>
          <Link href="/settings" className={menuItem} role="menuitem" onClick={onClose}>
            設定
          </Link>
          <button
            className={menuItem}
            role="menuitem"
            type="button"
            onClick={() => {
              onSignOut();
              onClose();
            }}
          >
            登出
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdownMenu;
