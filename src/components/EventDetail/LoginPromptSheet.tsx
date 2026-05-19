'use client';

import { useEffect, useRef } from 'react';
import { css } from '@/styled-system/css';

const overlay = css({
  position: 'fixed',
  inset: '0',
  background: 'rgba(0,0,0,0.5)',
  zIndex: '200',
  transition: 'opacity 280ms ease-out',
});

const sheet = css({
  position: 'fixed',
  bottom: '0',
  left: '0',
  right: '0',
  maxWidth: '480px',
  marginX: 'auto',
  backgroundColor: 'color.background.primary',
  borderTopLeftRadius: 'radius.xl',
  borderTopRightRadius: 'radius.xl',
  boxShadow: 'shadow.xl',
  zIndex: '201',
  paddingX: '4',
  paddingTop: '4',
});

const handleBar = css({
  width: '40px',
  height: '4px',
  backgroundColor: 'color.border.medium',
  borderRadius: '2px',
  marginX: 'auto',
  marginBottom: '4',
  marginTop: '3',
});

const title = css({
  textStyle: 'h4',
  color: 'color.text.primary',
  textAlign: 'center',
  marginBottom: '2',
  marginTop: '0',
});

const description = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  textAlign: 'center',
  marginBottom: '6',
  marginTop: '0',
});

const primaryButton = css({
  display: 'block',
  width: '100%',
  height: '48px',
  backgroundColor: 'color.primary',
  color: 'white',
  border: 'none',
  borderRadius: 'radius.lg',
  textStyle: 'button',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  '&:hover': {
    opacity: '0.9',
  },
});

const secondaryButton = css({
  display: 'block',
  width: '100%',
  height: '48px',
  backgroundColor: 'transparent',
  color: 'color.text.primary',
  border: '1px solid',
  borderColor: 'color.border.medium',
  borderRadius: 'radius.lg',
  textStyle: 'button',
  cursor: 'pointer',
  marginTop: '3',
  transition: 'background 0.2s ease',
  '&:hover': {
    backgroundColor: 'color.background.secondary',
  },
});

interface LoginPromptSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginToFavorite: () => void;
  onShare: () => void;
}

export default function LoginPromptSheet({
  isOpen,
  onClose,
  onLoginToFavorite,
  onShare,
}: LoginPromptSheetProps) {
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      loginButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const first = loginButtonRef.current;
        const last = shareButtonRef.current;
        if (!first || !last) return;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sheetTransition = isOpen ? 'transform 280ms ease-out' : 'transform 240ms ease-in';

  return (
    <>
      <div
        className={overlay}
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={sheet}
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: sheetTransition,
          paddingBottom: 'max(calc(env(safe-area-inset-bottom) + 24px), 24px)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="收藏活動"
        aria-hidden={!isOpen}
      >
        <div className={handleBar} aria-hidden="true" />
        <h2 className={title}>收藏這個活動</h2>
        <p className={description}>登入後可以收藏活動，或直接分享給朋友</p>
        <button ref={loginButtonRef} className={primaryButton} onClick={onLoginToFavorite}>
          登入以收藏
        </button>
        <button ref={shareButtonRef} className={secondaryButton} onClick={onShare}>
          分享此活動
        </button>
      </div>
    </>
  );
}
