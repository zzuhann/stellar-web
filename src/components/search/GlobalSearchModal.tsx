'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useSearchModalStore } from '@/store/useSearchModalStore';

const ArtistSearchModal = dynamic(() => import('./ArtistSearchModal'), {
  ssr: false,
  loading: () => null,
});

// Mounted once at layout level so header/TopArtistsSection/SearchSection share this single modal instance instead of each owning their own.
export default function GlobalSearchModal() {
  const isOpen = useSearchModalStore((state) => state.isOpen);
  const entryPoint = useSearchModalStore((state) => state.entryPoint);
  const triggerRef = useSearchModalStore((state) => state.triggerRef);
  const close = useSearchModalStore((state) => state.close);
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);

  // A route change (link nav, back/forward, or a dynamic segment swap like /map/A -> /map/B) ends the search session even though this component itself never unmounts.
  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      close();
    }
  }, [pathname, close]);

  // Always mount (even before the first open) so the lazy chunk preloads right after hydration and the open transition can play on first click.
  return (
    <ArtistSearchModal
      isOpen={isOpen}
      onClose={close}
      triggerRef={triggerRef ?? undefined}
      entryPoint={entryPoint}
    />
  );
}
