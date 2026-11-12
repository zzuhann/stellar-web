'use client';

import { Toaster } from 'sonner';
import { css } from '@/styled-system/css';

const successToast = css({
  borderColor: 'var(--colors-green-500) !important',
  color: 'var(--colors-green-800) !important',
});

const actionButton = css({
  position: 'relative',
  // Keep a 44px touch target without making the notification taller.
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-8px',
    bottom: '-8px',
    left: 0,
    right: 0,
  },
  '&:hover, &:active': { background: 'color.background.secondary !important' },
  '&:focus-visible': {
    outline: '2px solid !important',
    outlineColor: 'currentColor !important',
    outlineOffset: '2px',
    boxShadow: 'none !important',
  },
});

const errorToast = css({
  borderColor: 'var(--colors-red-600) !important',
  color: 'var(--colors-red-800) !important',
});

const warningToast = css({
  borderColor: 'var(--colors-amber-500) !important',
  color: 'var(--colors-amber-800) !important',
});

const StyledToaster = () => {
  return (
    <Toaster
      position="top-center"
      closeButton
      toastOptions={{
        style: {
          background: 'var(--colors-gray-0)',
          color: 'var(--colors-gray-700)',
          border: '1px solid var(--colors-gray-200)',
          borderRadius: '8px',
          padding: '12px 16px',
          gap: '12px',
          alignItems: 'center',
          maxWidth: '400px',
          fontFamily: 'var(--font-noto-sans-tc)',
          fontSize: '14px',
        },
        actionButtonStyle: {
          background: 'transparent',
          color: 'inherit',
          height: '28px',
          minWidth: '44px',
          padding: '0 8px',
          borderRadius: 'var(--radii-radius-md)',
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 500,
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
          lineHeight: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginLeft: 'auto',
        },
        classNames: {
          success: successToast,
          actionButton,
          error: errorToast,
          warning: warningToast,
        },
      }}
    />
  );
};

export default StyledToaster;
