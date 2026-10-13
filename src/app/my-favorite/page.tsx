'use client';

import { Suspense } from 'react';
import MyFavorites from '@/components/MyFavorites';
import Loading from '@/components/Loading';

export default function MyFavoritePage() {
  return (
    <Suspense fallback={<Loading />}>
      <MyFavorites />
    </Suspense>
  );
}
