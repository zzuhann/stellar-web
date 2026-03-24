'use client';

import { Toaster } from 'react-hot-toast';
import { css } from '@/styled-system/css';

const toasterWrapper = css({
  '& > div': {
    '& > div': {
      textStyle: 'bodySmall',
    },
  },
});

const toastBaseStyle = {
  background: 'var(--colors-gray-0)',
  color: 'var(--colors-gray-700)',
  border: '1px solid var(--colors-gray-200)',
  borderRadius: '8px',
  padding: '12px 16px',
  maxWidth: '400px',
};

const StyledToaster = () => {
  return (
    <div className={toasterWrapper}>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: toastBaseStyle,
          success: {
            style: {
              border: '1px solid var(--colors-green-500)',
              color: 'var(--colors-green-800)',
            },
            iconTheme: {
              primary: 'var(--colors-green-500)',
              secondary: 'var(--colors-gray-0)',
            },
          },
          error: {
            style: {
              border: '1px solid var(--colors-red-600)',
              color: 'var(--colors-red-800)',
            },
            iconTheme: {
              primary: 'var(--colors-red-600)',
              secondary: 'var(--colors-gray-0)',
            },
          },
        }}
      />
    </div>
  );
};

export default StyledToaster;
