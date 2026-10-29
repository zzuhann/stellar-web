'use client';

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { css } from '@/styled-system/css';

// "×" confirmation (venue-tags §D 離開). Escape/backdrop mean "keep filling", never "leave".

const dialogRoot = css({ position: 'relative', zIndex: 50 });
const backdrop = css({ position: 'fixed', inset: 0, background: 'alpha.black.50' });
const wrapper = css({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4',
});
const panel = css({
  width: '100%',
  maxWidth: '400px',
  padding: '5',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  boxShadow: 'shadow.lg',
  display: 'flex',
  flexDirection: 'column',
  gap: '5',
});
const titleStyle = css({ margin: 0, textStyle: 'h4', color: 'color.text.primary' });
const actions = css({ display: 'flex', gap: '2' });
const buttonBase = {
  flex: 1,
  minHeight: '44px',
  borderRadius: 'radius.md',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary', outlineOffset: '2px' },
} as const;
const outlineButton = css({
  ...buttonBase,
  border: '1px solid',
  borderColor: 'color.border.medium',
  background: 'color.background.primary',
  color: 'color.text.primary',
  '&:hover': { background: 'color.background.secondary' },
});
const primaryButton = css({
  ...buttonBase,
  border: 'none',
  background: 'color.primary',
  color: 'color.background.primary',
  '&:hover': { background: 'color.primaryHover' },
});

interface LeaveDialogProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export default function LeaveDialog({ open, onStay, onLeave }: LeaveDialogProps) {
  return (
    <Dialog open={open} onClose={onStay} role="alertdialog" className={dialogRoot}>
      <DialogBackdrop className={backdrop} />
      <div className={wrapper}>
        <DialogPanel className={panel}>
          <DialogTitle className={titleStyle}>要離開嗎？目前填寫的資料都不會儲存哦！</DialogTitle>
          <div className={actions}>
            <button type="button" className={outlineButton} onClick={onLeave}>
              離開
            </button>
            <button type="button" className={primaryButton} onClick={onStay} data-autofocus>
              繼續填寫
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
