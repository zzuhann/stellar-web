'use client';

import { Suspense } from 'react';
import MyFavorites from '@/components/MyFavorites';
import Loading from '@/components/Loading';
import { usePageView } from '@/hooks/usePageView';

export default function MyFavoritePage() {
  usePageView({ eventPage: '/my-favorite' });

  return (
    <Suspense fallback={<Loading />}>
      <MyFavorites />
    </Suspense>
  );
}
