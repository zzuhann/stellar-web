import { useCallback, useEffect, useRef } from 'react';
import { useArtist } from '@/hooks/useArtist';
import type { Artist } from '@/types';

interface UsePreselectedArtistOptions {
  artistId: string | undefined;
  onPreselect: (artist: Artist) => void;
}

// Applies the artist from ?artistId= once, silently: missing / non-approved / failed lookups do nothing.
export default function usePreselectedArtist({
  artistId,
  onPreselect,
}: UsePreselectedArtistOptions) {
  const { data: artist, isSuccess } = useArtist(artistId ?? '');
  // Set by either a manual selection change or a finished preselect; once true the preselect never applies.
  const settledRef = useRef(false);
  const onPreselectRef = useRef(onPreselect);

  useEffect(() => {
    onPreselectRef.current = onPreselect;
  });

  useEffect(() => {
    if (settledRef.current || !isSuccess || !artist) return;
    settledRef.current = true;
    if (artist.status === 'approved') onPreselectRef.current(artist);
  }, [isSuccess, artist]);

  const markUserChanged = useCallback(() => {
    settledRef.current = true;
  }, []);

  return { markUserChanged };
}
