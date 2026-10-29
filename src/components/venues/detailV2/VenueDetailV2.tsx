'use client';

import Image from 'next/image';
import { css, cx } from '@/styled-system/css';
import type { Venue, VenueDetail, VenueTagDictionary } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { trackClickVenueContact } from '@/lib/analytics/venues';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { buildVenueContact } from '@/utils/venueContact';
import {
  buildVenueFacilityRows,
  buildVenueUsageRows,
  getVisibleVenueTags,
} from '@/utils/venueTags';
import { CAPACITY_RANGE_LABEL } from '../venueCapacity';
import VenueGallery from '../VenueGallery';
import PastEventsStrip from '../PastEventsStrip';
import RelatedVenuesStrip from '../RelatedVenuesStrip';
import VenueUsageSummary from './components/VenueUsageSummary';
import VenueSourceMeta from './components/VenueSourceMeta';
import VenueFacilities from './components/VenueFacilities';
import VenueDescription from './components/VenueDescription';
import VenueLocation from './components/VenueLocation';
import VenueCorrectionNote from './components/VenueCorrectionNote';
import VenueContactCard from './components/VenueContactCard';
import VenueContactBar from './components/VenueContactBar';
import { tag } from './components/styles';
import { formatTransitHeader, pickPrimaryTransit } from '@/utils/transitStops';

// Flex column so the sticky contact bar rests at the viewport bottom even on short pages
const pageOuter = css({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100dvh',
  background: 'color.background.primary',
  paddingTop: '70px',
});

const shell = css({
  flexGrow: 1,
  width: '100%',
  maxWidth: '640px',
  marginX: 'auto',
  paddingTop: '3',
  paddingBottom: '10',
  lg: { maxWidth: '1200px', paddingX: '6', paddingTop: '6' },
});

const columns = css({
  lg: { display: 'flex', gap: '12' },
});

const mainCol = css({
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '6',
  lg: { flex: '999 1 560px', gap: '8' },
});

// Desktop-only right column; stretches to the main column height so the contact card stays sticky
const asideCol = css({
  display: 'none',
  lg: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6',
    flex: '1 1 360px',
    minWidth: 0,
  },
});

const mobileOnly = css({
  lg: { display: 'none' },
});

const header = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  paddingX: '4',
});

const thumb = css({
  position: 'relative',
  flexShrink: 0,
  width: '64px',
  height: '64px',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  background: 'gray.100',
});

const headerText = css({
  minWidth: 0,
});

const venueName = css({
  margin: 0,
  textStyle: 'h1',
  color: 'color.text.primary',
  overflowWrap: 'anywhere',
  lg: { textStyle: 'display' },
});

const headerLine = css({
  margin: 0,
  marginTop: '1',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  fontVariantNumeric: 'tabular-nums',
  lg: { textStyle: 'body' },
});

const headerLocation = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: '2',
  rowGap: '1',
});

const breadcrumbWrap = css({
  // Breadcrumb has its own 20px gutter; pull it back to the 16px content edge
  marginX: '-1',
});

// transitStops null = never saved with the new field: fall back to the legacy MRT fields;
// [] = cleared on purpose, show nothing (design-backend §10.5, TC-141)
const formatMrt = (venue: VenueDetail): string | null => {
  if (Array.isArray(venue.transitStops)) {
    const primary = pickPrimaryTransit(venue.transitStops);
    return primary ? formatTransitHeader(primary) : null;
  }
  if (!venue.nearestMrt) return null;
  const station = `${venue.nearestMrt.replace(/站$/, '')}站`;
  return venue.mrtWalkMinutes ? `${station}步行 ${venue.mrtWalkMinutes} 分鐘` : station;
};

interface VenueDetailV2Props {
  venue: VenueDetail;
  relatedVenues: Venue[];
  dictionary: VenueTagDictionary | null;
  // Taipei YYYY-MM-DD from the server so render and hydration agree around midnight
  today: string;
  // false on the preview page: store owners' own clicks must not count as conversions
  analyticsEnabled: boolean;
}

export default function VenueDetailV2({
  venue,
  relatedVenues,
  dictionary,
  today,
  analyticsEnabled,
}: VenueDetailV2Props) {
  const { user } = useAuth();

  const visibleTags = getVisibleVenueTags(venue.tags, dictionary, today);
  const usageRows = buildVenueUsageRows(visibleTags, today);
  const facilityRows = dictionary ? buildVenueFacilityRows(visibleTags, dictionary) : [];
  const contact = buildVenueContact(venue);
  const sourceLinks = venue.sourceLinks ?? [];
  const infoUpdatedOn = venue.infoUpdatedOn ?? null;
  const photos = [venue.coverPhoto, ...(venue.otherPhotos ?? [])].filter(Boolean) as string[];

  const region = venue.region?.trim() ?? '';
  const mrtText = formatMrt(venue);
  const capacityText = venue.capacityRange
    ? `容納 ${CAPACITY_RANGE_LABEL[venue.capacityRange] ?? venue.capacityRange}`
    : null;

  const handleClickContact = analyticsEnabled
    ? (contactType: string) =>
        trackClickVenueContact({ userId: user?.uid, venueId: venue.id, contactType })
    : undefined;

  const sourceMeta = <VenueSourceMeta sourceLinks={sourceLinks} infoUpdatedOn={infoUpdatedOn} />;
  const hasSourceMeta = sourceLinks.length > 0 || Boolean(infoUpdatedOn);

  return (
    <div className={pageOuter}>
      <div className={shell}>
        <div className={columns}>
          <div className={mainCol}>
            <div>
              <div className={breadcrumbWrap}>
                <Breadcrumb
                  items={[
                    { label: '生咖場地', href: '/venues' },
                    {
                      label: venue.region,
                      href: `/venues?region=${encodeURIComponent(venue.region)}`,
                    },
                    { label: venue.name },
                  ]}
                />
              </div>
              <header className={header}>
                {venue.coverPhoto && (
                  <div className={thumb}>
                    <Image
                      src={venue.coverPhoto}
                      alt=""
                      fill
                      sizes="64px"
                      unoptimized
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div className={headerText}>
                  <h1 className={venueName}>{venue.name}</h1>
                  {(region || mrtText) && (
                    <p className={cx(headerLine, headerLocation)}>
                      {region && <span className={tag}>{region}</span>}
                      {mrtText && <span>{mrtText}</span>}
                    </p>
                  )}
                  {capacityText && <p className={headerLine}>{capacityText}</p>}
                </div>
              </header>
            </div>

            {usageRows.length > 0 && (
              <VenueUsageSummary
                rows={usageRows}
                sourceLinks={sourceLinks}
                infoUpdatedOn={infoUpdatedOn}
              />
            )}

            <div className={mobileOnly}>
              <VenueGallery photos={photos} venueName={venue.name} />
            </div>

            <VenueFacilities rows={facilityRows} equipmentNote={venue.equipmentNote ?? ''} />

            <VenueDescription
              description={venue.description}
              meta={usageRows.length === 0 && hasSourceMeta ? sourceMeta : undefined}
            />

            <div className={mobileOnly}>
              <VenueLocation venue={venue} />
            </div>

            {venue.events?.length > 0 && (
              <PastEventsStrip
                events={venue.events}
                showTimeStatus
                trackClicks={analyticsEnabled}
              />
            )}

            {relatedVenues.length > 0 && (
              <RelatedVenuesStrip venues={relatedVenues} region={venue.region} />
            )}

            <VenueCorrectionNote />
          </div>

          <div className={asideCol}>
            <VenueContactCard contact={contact} onClickContact={handleClickContact} />
            <VenueGallery photos={photos} venueName={venue.name} />
            <VenueLocation venue={venue} />
          </div>
        </div>
      </div>

      {contact && <VenueContactBar contact={contact} onClickContact={handleClickContact} />}
    </div>
  );
}
