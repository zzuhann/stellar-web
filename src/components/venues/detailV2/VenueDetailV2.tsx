'use client';

import Image from 'next/image';
import { css, cx } from '@/styled-system/css';
import type { Venue, VenueDetail, VenueTagDictionary } from '@/types';
import { useAuth } from '@/lib/auth-context';
import {
  trackClickVenueContact,
  trackClickVenueCorrection,
  trackClickVenueSourceLink,
  type VenueContactButtonLocation,
  type VenueCorrectionContactType,
} from '@/lib/analytics/venues';
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
import {
  areaAside,
  areaCorrection,
  areaDescription,
  areaEvents,
  areaFacilities,
  areaHeader,
  areaPhotos,
  areaRelated,
  areaUsage,
  detailLayout,
  pageOuter,
  shell,
} from './layout';
import {
  formatTransitHeader,
  formatTransitListItem,
  getVenueHeaderTransit,
} from '@/utils/transitStops';

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

interface VenueDetailV2Props {
  venue: VenueDetail;
  relatedVenues: Venue[];
  dictionary: VenueTagDictionary | null;
  // Taipei YYYY-MM-DD from the server so render and hydration agree around midnight
  today: string;
}

export default function VenueDetailV2({
  venue,
  relatedVenues,
  dictionary,
  today,
}: VenueDetailV2Props) {
  const { user } = useAuth();
  const userId = user?.uid;

  const visibleTags = getVisibleVenueTags(venue.tags, dictionary, today);
  const usageRows = buildVenueUsageRows(visibleTags, today);
  const facilityRows = buildVenueFacilityRows(
    visibleTags,
    dictionary,
    (venue.transitStops ?? []).map(formatTransitListItem)
  );
  const contact = buildVenueContact(venue);
  const sourceLinks = venue.sourceLinks ?? [];
  const infoUpdatedOn = venue.infoUpdatedOn ?? null;
  const photos = [venue.coverPhoto, ...(venue.otherPhotos ?? [])].filter(Boolean) as string[];

  const region = venue.region?.trim() ?? '';
  const headerTransit = getVenueHeaderTransit(venue);
  const mrtText = headerTransit ? formatTransitHeader(headerTransit) : null;
  const capacityText = venue.capacityRange
    ? `容納 ${CAPACITY_RANGE_LABEL[venue.capacityRange] ?? venue.capacityRange}`
    : null;

  const trackContact = (buttonLocation: VenueContactButtonLocation) => (contactType: string) =>
    trackClickVenueContact({ userId, venueId: venue.id, contactType, buttonLocation });
  const trackSourceLink = (listPosition: number) =>
    trackClickVenueSourceLink({ userId, venueId: venue.id, listPosition });
  const trackCorrection = (contactType: VenueCorrectionContactType) =>
    trackClickVenueCorrection({ userId, venueId: venue.id, contactType });

  const hasSourceMeta = sourceLinks.length > 0 || Boolean(infoUpdatedOn);

  return (
    <div className={pageOuter}>
      <div className={shell}>
        <div className={detailLayout}>
          <div className={areaHeader}>
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
            <div className={areaUsage}>
              <VenueUsageSummary
                rows={usageRows}
                sourceLinks={sourceLinks}
                infoUpdatedOn={infoUpdatedOn}
                onClickSourceLink={trackSourceLink}
              />
            </div>
          )}

          <div className={areaPhotos}>
            <VenueGallery photos={photos} venueName={venue.name} />
          </div>

          <div className={areaFacilities}>
            <VenueFacilities rows={facilityRows} equipmentNote={venue.equipmentNote ?? ''} />
          </div>

          <div className={areaDescription}>
            <VenueDescription
              description={venue.description}
              meta={
                usageRows.length === 0 && hasSourceMeta ? (
                  <VenueSourceMeta
                    sourceLinks={sourceLinks}
                    infoUpdatedOn={infoUpdatedOn}
                    onClickLink={trackSourceLink}
                  />
                ) : undefined
              }
            />
          </div>

          <div className={areaAside}>
            <VenueContactCard contact={contact} onClickContact={trackContact('side_card')} />
            <VenueLocation venue={venue} />
          </div>

          {venue.events?.length > 0 && (
            <div className={areaEvents}>
              <PastEventsStrip events={venue.events} />
            </div>
          )}

          {relatedVenues.length > 0 && (
            <div className={areaRelated}>
              <RelatedVenuesStrip venues={relatedVenues} region={venue.region} />
            </div>
          )}

          <div className={areaCorrection}>
            <VenueCorrectionNote onClickLink={trackCorrection} />
          </div>
        </div>
      </div>

      {contact && <VenueContactBar contact={contact} onClickContact={trackContact('sticky_bar')} />}
    </div>
  );
}
