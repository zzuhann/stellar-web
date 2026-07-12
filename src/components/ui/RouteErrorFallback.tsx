'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
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

interface RouteErrorFallbackProps {
  title: string;
  error: Error & { digest?: string };
  reset: () => void;
  routeTag?: string;
}

export default function RouteErrorFallback({
  title: titleText,
  error,
  reset,
  routeTag,
}: RouteErrorFallbackProps) {
  useEffect(() => {
    Sentry.captureException(error, routeTag ? { tags: { route: routeTag } } : undefined);
  }, [error, routeTag]);

  return (
    <div className={container}>
      <h1 className={title}>{titleText}</h1>
      <p className={description}>可能是網路不穩或伺服器忙線中，可以稍後再試</p>
      <button type="button" className={retryButton} onClick={() => reset()}>
        重新整理
      </button>
    </div>
  );
}
