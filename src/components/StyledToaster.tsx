'use client';

import { Toaster } from 'sonner';
import { css } from '@/styled-system/css';

const successToast = css({
  borderColor: 'var(--colors-green-500) !important',
  color: 'var(--colors-green-800) !important',
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
          maxWidth: '400px',
          fontFamily: 'var(--font-noto-sans-tc)',
          fontSize: '14px',
        },
        classNames: {
          success: successToast,
          error: errorToast,
          warning: warningToast,
        },
      }}
    />
  );
};

export default StyledToaster;
