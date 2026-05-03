'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ArtistCard from './index';
import { Artist } from '@/types';

interface ArtistCardLinkProps {
  artist: Artist;
  ariaLabel?: string;
  onBeforeNavigate?: () => void;
}

export default function ArtistCardLink({
  artist,
  ariaLabel,
  onBeforeNavigate,
}: ArtistCardLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onBeforeNavigate?.();
    startTransition(() => {
      router.push(`/map/${artist.id}`);
    });
  };

  return (
    <Link
      href={`/map/${artist.id}`}
      aria-label={ariaLabel ?? `前往 ${artist.stageName} 的生日應援地圖頁面`}
      onClick={handleClick}
    >
      <ArtistCard artist={artist} isPending={isPending} />
    </Link>
  );
}
