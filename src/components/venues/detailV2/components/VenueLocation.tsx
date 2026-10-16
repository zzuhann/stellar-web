import { useId } from 'react';
import { ArrowTopRightOnSquareIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import type { VenueDetail } from '@/types';
import { InstagramIcon, ThreadsIcon } from '@/components/ui/SocialMediaIcons';
import { buildVenueSocialLink } from '@/utils/venueContact';
import InfoRow from '../../InfoRow';
import VenueMapEmbed from '../../VenueMapEmbed';
import { externalIcon, sectionTitle } from './styles';

const section = css({
  paddingX: '4',
});

const rows = css({
  marginTop: '1',
});

const infoLink = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  minHeight: '44px',
  color: 'inherit',
  textDecoration: 'none',
  overflowWrap: 'anywhere',
  '&:hover': { textDecoration: 'underline' },
});

const iconMuted = css({ color: 'gray.500' });

interface VenueLocationProps {
  venue: Pick<VenueDetail, 'name' | 'address' | 'lat' | 'lng' | 'placeId' | 'socialMedia'>;
}

export default function VenueLocation({ venue }: VenueLocationProps) {
  const headingId = useId();
  const socialLink = buildVenueSocialLink(venue);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}&query_place_id=${venue.placeId}`;

  return (
    <section aria-labelledby={headingId} className={section}>
      <h2 id={headingId} className={sectionTitle}>
        地址與社群
      </h2>
      <div className={rows}>
        {socialLink && (
          <InfoRow
            icon={socialLink.type === 'threads' ? <ThreadsIcon /> : <InstagramIcon />}
            label="社群"
            value={
              <a
                href={socialLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className={infoLink}
              >
                {socialLink.text}
                <span className={iconMuted}>
                  <ArrowTopRightOnSquareIcon
                    width={12}
                    height={12}
                    aria-hidden="true"
                    className={externalIcon}
                  />
                </span>
                <span className="sr-only">（開新分頁）</span>
              </a>
            }
          />
        )}
        <InfoRow
          icon={<MapPinIcon width={16} height={16} aria-hidden="true" />}
          label="地址"
          value={
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={infoLink}>
              {venue.address}
              <span className={iconMuted}>
                <ArrowTopRightOnSquareIcon
                  width={12}
                  height={12}
                  aria-hidden="true"
                  className={externalIcon}
                />
              </span>
              <span className="sr-only">在 Google Maps 開啟（開新分頁）</span>
            </a>
          }
        />
        <VenueMapEmbed placeId={venue.placeId} venueName={venue.name} />
      </div>
    </section>
  );
}
