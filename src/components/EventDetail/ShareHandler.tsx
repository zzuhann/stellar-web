'use client';

import { useEffect } from 'react';
import { useShare } from '@/context/ShareContext';

interface ShareHandlerProps {
  title: string;
}

export default function ShareHandler({ title }: ShareHandlerProps) {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const { setShareData, resetShareData } = useShare();

  useEffect(() => {
    setShareData({ text: `${title} | STELLAR 台灣生日應援地圖`, url });
    return () => resetShareData();
  }, [title, url, setShareData, resetShareData]);

  return null;
}
