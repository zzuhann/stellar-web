'use client';

import { Toaster } from 'sonner';
import { css } from '@/styled-system/css';

const successToast = css({
  borderColor: 'var(--colors-green-500) !important',
  color: 'var(--colors-green-800) !important',
});

const actionButton = css({
  '&:hover': { background: 'color.primaryHover !important' },
  '&:active': { background: 'color.primaryActive !important' },
  '&:focus-visible': {
    outline: '2px solid !important',
    outlineColor: 'color.primary !important',
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
          background: 'var(--colors-color-primary)',
          color: 'var(--colors-gray-0)',
          height: '44px',
          minWidth: '64px',
          padding: '0 12px',
          borderRadius: 'var(--radii-radius-md)',
          fontFamily: 'inherit',
          fontSize: '14px',
          fontWeight: 500,
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
