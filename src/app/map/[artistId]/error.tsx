'use client';

import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';

const container = css({
  minHeight: '100dvh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'gray.50',
  flexDirection: 'column',
  gap: '4',
  padding: '5',
});

const icon = css({
  width: '48px',
  height: '48px',
  color: 'color.text.tertiary',
});

const title = css({
  textStyle: 'h4',
  margin: 0,
  color: 'color.text.primary',
  textAlign: 'center',
});

const description = css({
  textStyle: 'bodySmall',
  margin: 0,
  color: 'color.text.secondary',
  textAlign: 'center',
});

const retryButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2',
  minWidth: '44px',
  minHeight: '44px',
  paddingY: '3',
  paddingX: '6',
  background: 'color.primary',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  borderRadius: 'radius.md',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  transition: 'background 0.2s ease',
  '&:hover': {
    background: 'stellarBlue.600',
  },
});

interface MapErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MapError({ reset }: MapErrorProps) {
  return (
    <div className={container}>
      <ArrowPathIcon className={icon} />
      <h1 className={title}>暫時無法載入地圖</h1>
      <p className={description}>可能是網路不穩或伺服器忙線中，可以稍後再試</p>
      <button type="button" className={retryButton} onClick={() => reset()}>
        重新整理
      </button>
    </div>
  );
}
