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

  // Nothing has opened the modal yet in this session; skip mounting it at all.
  if (!entryPoint) return null;

  return (
    <ArtistSearchModal
      isOpen={isOpen}
      onClose={close}
      triggerRef={triggerRef ?? undefined}
      entryPoint={entryPoint}
    />
  );
}
