'use client';

import { usePageShare } from '@/hooks/usePageShare';

interface ShareHandlerProps {
  title: string;
}

export default function ShareHandler({ title }: ShareHandlerProps) {
  const url = typeof window !== 'undefined' ? window.location.href : '';

  usePageShare({
    text: `${title} | STELLAR 台灣生日應援地圖`,
    url,
  });

  return null;
}
