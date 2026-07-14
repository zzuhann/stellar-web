'use client';

import Link from 'next/link';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import type { CoffeeEvent } from '@/types';
import ExternalLink from '@/components/ui/ExternalLink';

interface EventLocationLinkProps {
  location: CoffeeEvent['location'];
  eventId: string;
}

export default function EventLocationLink({ location, eventId }: EventLocationLinkProps) {
  const label = `${location.name}(${location.address})`;

  if (location.venueId && location.venueActive === true) {
    return (
      <Link
        href={`/venues/${location.venueId}`}
        aria-label={`${label}，查看場地詳情`}
        style={{ color: 'var(--colors-stellar-blue-500)' }}
      >
        {label}
      </Link>
    );
  }

  return (
    <ExternalLink
      href={`https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`}
      platform="location"
      eventPage="/event/[id]"
      contentId={eventId}
      style={{ color: 'var(--colors-stellar-blue-500)' }}
    >
      {label}&nbsp;
      <ArrowTopRightOnSquareIcon
        style={{ display: 'inline', verticalAlign: 'middle' }}
        width={16}
        height={16}
        aria-hidden="true"
      />
      <span className="sr-only">（在新視窗開啟 Google 地圖）</span>
    </ExternalLink>
  );
}
