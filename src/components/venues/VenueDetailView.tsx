'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { css } from '@/styled-system/css';
import { useAuth } from '@/lib/auth-context';
import { usePageView } from '@/hooks/usePageView';
import {
  toVenueContentId,
  trackClickVenueContact,
  trackClickVenueMap,
} from '@/lib/analytics/venues';
import type { Venue, VenueDetail } from '@/types';
import { CAPACITY_RANGE_LABEL } from './venueCapacity';
import VenueGallery from './VenueGallery';
import InfoRow from './InfoRow';
import PastEventsStrip from './PastEventsStrip';
import RelatedVenuesStrip from './RelatedVenuesStrip';
import {
  ChevronLeftIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { InstagramIcon, ThreadsIcon } from '@/components/ui/SocialMediaIcons';
import { cleanSocialMediaHandle } from '@/utils/socialMedia';

const pageOuter = css({
  minHeight: '100vh',
  background: 'color.background.primary',
  paddingTop: '70px',
});

const page = css({
  maxWidth: '500px',
  margin: '0 auto',
  background: 'color.background.primary',
  paddingBottom: '10',
  boxShadow: 'shadow.md',
});

const backBar = css({
  paddingTop: '3',
  paddingX: '4',
  paddingBottom: '2',
});

const backBtn = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  textDecoration: 'none',
  paddingY: '1',
  paddingX: '0',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  fontWeight: 'medium',
  '&:hover': {
    color: 'color.primary',
  },
});

const titleSection = css({
  paddingTop: '3',
  paddingX: '4',
  paddingBottom: '1',
});

const venueName = css({
  margin: 0,
  textStyle: 'h3',
  fontWeight: 'bold',
  color: 'color.text.primary',
});

const statsGrid = css({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '2',
  marginTop: '3',
});

const statBox = css({
  paddingY: '2.5',
  paddingX: '3',
  borderRadius: 'radius.lg',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
});

const statLabel = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
});

const statValue = css({
  marginTop: '1',
  textStyle: 'h3',
  fontWeight: 'bold',
  color: 'color.text.primary',
  letterSpacing: '0.01em',
});

const statUnit = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const infoSection = css({
  paddingTop: '5',
  paddingX: '4',
  paddingBottom: '2',
});

const sectionTitle = css({
  margin: 0,
  textStyle: 'bodySmall',
  fontWeight: 'bold',
  color: 'color.text.primary',
});

const bookingSubtitle = css({
  marginTop: '1',
  marginX: '0',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const bookingDescHint = css({
  marginTop: '2',
  marginX: '0',
  paddingY: '1.5',
  paddingX: '2.5',
  borderLeft: '3px solid',
  borderLeftColor: 'amber.400',
  textStyle: 'caption',
  color: 'color.text.secondary',
  lineHeight: 1.5,
});

const descSection = css({
  paddingY: '3',
  paddingX: '4',
});

const descText = css({
  marginTop: '2',
  marginX: '0',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  lineHeight: 1.7,
  whiteSpace: 'pre-wrap',
});

const bookingSection = css({
  paddingTop: '4',
  paddingX: '4',
  paddingBottom: '0',
});

const primaryBtn = css({
  paddingY: '3',
  paddingX: '5',
  borderRadius: 'radius.md',
  border: 'none',
  background: 'color.primary',
  color: 'white',
  cursor: 'pointer',
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  letterSpacing: '0.04em',
  display: 'inline-block',
  textDecoration: 'none',
  textAlign: 'center',
  transition: 'background 0.15s ease',
  '&:hover': {
    background: 'color.primaryHover',
  },
});

const venueListSection = css({
  paddingTop: '4',
  paddingX: '4',
  paddingBottom: '10',
});

const venueListBtn = css({
  width: '100%',
  padding: '3',
  borderRadius: 'radius.md',
  background: 'color.background.secondary',
  color: 'color.text.primary',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'color.border.light',
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  display: 'block',
  textDecoration: 'none',
  textAlign: 'center',
  transition: 'border-color 0.15s ease, color 0.15s ease',
  '&:hover': {
    borderColor: 'color.primary',
    color: 'color.primary',
  },
});

const mrtIconCls = css({
  width: '18px',
  height: '18px',
  borderRadius: 'radius.sm',
  background: 'stellarBlue.500',
  color: 'white',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textStyle: 'caption',
  fontWeight: 'bold',
  flexShrink: 0,
});

const mapIconWrapper = css({
  color: 'gray.400',
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'middle',
  marginLeft: '1',
});

const infoRowsWrap = css({
  marginTop: '1',
});

const infoLink = css({
  color: 'inherit',
  textDecoration: 'none',
});

const bookingBtnWrap = css({
  marginTop: '2.5',
  display: 'flex',
});

function MrtIcon() {
  return <span className={mrtIconCls}>M</span>;
}

interface BookingChannel {
  label: string;
  url: string;
}

function buildBookingChannel(venue: VenueDetail): BookingChannel | null {
  switch (venue.preferredContact) {
    case 'form':
      if (venue.contactUrl) return { label: '查看預約資訊', url: venue.contactUrl };
      break;
    case 'line':
      if (venue.contactUrl) return { label: 'LINE 聯繫', url: venue.contactUrl };
      break;
    case 'instagram':
      if (venue.socialMedia?.instagram)
        return {
          label: '前往 Instagram 主頁',
          url: `https://www.instagram.com/${cleanSocialMediaHandle(venue.socialMedia.instagram)}`,
        };
      break;
    case 'threads':
      if (venue.socialMedia?.threads)
        return {
          label: '前往 Threads 主頁',
          url: `https://www.threads.com/@${venue.socialMedia.threads}`,
        };
      break;
    case 'other':
      if (venue.contactUrl) return { label: '查看聯絡資訊', url: venue.contactUrl };
      break;
  }
  return null;
}

function buildSocialLink(
  venue: VenueDetail
): { text: string; url: string; type: 'instagram' | 'threads' | 'line' } | null {
  const sm = venue.socialMedia;
  if (!sm) return null;
  if (sm.instagram)
    return {
      text: sm.instagram,
      url: `https://www.instagram.com/${cleanSocialMediaHandle(sm.instagram)}`,
      type: 'instagram',
    };
  if (sm.threads)
    return { text: sm.threads, url: `https://www.threads.com/@${sm.threads}`, type: 'threads' };
  if (sm.line) return { text: sm.line, url: sm.line, type: 'line' };
  return null;
}

interface VenueDetailViewProps {
  venue: VenueDetail;
  relatedVenues: Venue[];
}

export default function VenueDetailView({ venue, relatedVenues }: VenueDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const photos = [venue.coverPhoto, ...(venue.otherPhotos ?? [])].filter(Boolean) as string[];
  const socialLink = buildSocialLink(venue);
  const bookingChannel = buildBookingChannel(venue);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}&query_place_id=${venue.placeId}`;

  usePageView({ eventPage: '/venues/[id]', contentId: toVenueContentId(venue.id) });

  const handleClickMap = () => {
    trackClickVenueMap({
      userId: user?.uid,
      venueId: venue.id,
    });
  };

  const handleClickContact = () => {
    trackClickVenueContact({
      userId: user?.uid,
      venueId: venue.id,
      contactType: venue.preferredContact ?? 'other',
    });
  };

  return (
    <div className={pageOuter}>
      <div className={page}>
        <div className={backBar}>
          <button type="button" className={backBtn} onClick={() => router.back()}>
            <ChevronLeftIcon width={16} height={16} aria-hidden="true" />
            場地列表
          </button>
        </div>

        <VenueGallery photos={photos} venueName={venue.name} />

        <section className={titleSection}>
          <h1 className={venueName}>{venue.name}</h1>

          <div className={statsGrid}>
            <div className={statBox}>
              <div className={statLabel}>容納人數</div>
              <div className={statValue}>
                {venue.capacityRange ? (
                  (CAPACITY_RANGE_LABEL[venue.capacityRange] ?? venue.capacityRange)
                ) : (
                  <span className={statUnit}>未提供</span>
                )}
              </div>
            </div>
            <div className={statBox}>
              <div className={statLabel}>生日應援紀錄</div>
              <div className={statValue}>
                {venue.eventCount} <span className={statUnit}>場</span>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="基本資訊" className={infoSection}>
          <h2 className={sectionTitle}>基本資訊</h2>
          <div className={infoRowsWrap}>
            <InfoRow
              icon={<MapPinIcon width={16} height={16} aria-hidden="true" />}
              label="地址"
              value={
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={infoLink}
                  onClick={handleClickMap}
                >
                  {venue.address}
                  <span className={mapIconWrapper}>
                    <ArrowTopRightOnSquareIcon width={12} height={12} aria-hidden="true" />
                  </span>
                  <span className="sr-only">在 Google Maps 開啟（開新分頁）</span>
                </a>
              }
            />
            {venue.nearestMrt && (
              <InfoRow
                icon={<MrtIcon />}
                label="捷運"
                value={`${venue.nearestMrt}${venue.mrtWalkMinutes ? ` · 步行 ${venue.mrtWalkMinutes} 分鐘` : ''}`}
              />
            )}
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
                    <span className={mapIconWrapper}>
                      <ArrowTopRightOnSquareIcon width={12} height={12} aria-hidden="true" />
                    </span>
                    <span className="sr-only">（開新分頁）</span>
                  </a>
                }
              />
            )}
          </div>
        </section>

        {bookingChannel && (
          <section aria-label="聯繫這個場地" className={bookingSection}>
            <h2 className={sectionTitle}>聯繫這個場地</h2>
            {venue.description ? (
              <p className={bookingDescHint}>預約前建議先閱讀下方「其他說明」。</p>
            ) : (
              <p className={bookingSubtitle}>請依場地規定確認預約步驟</p>
            )}
            <div className={bookingBtnWrap}>
              <a
                href={bookingChannel.url}
                target="_blank"
                rel="noopener noreferrer"
                className={primaryBtn}
                onClick={handleClickContact}
              >
                {bookingChannel.label}
                <span className="sr-only">（開新分頁）</span>
              </a>
            </div>
          </section>
        )}

        {venue.description && (
          <section aria-label="其他說明" className={descSection}>
            <h2 className={sectionTitle}>其他說明</h2>
            <p className={descText}>{venue.description}</p>
          </section>
        )}

        {venue.events && venue.events.length > 0 && <PastEventsStrip events={venue.events} />}

        {relatedVenues.length > 0 ? (
          <RelatedVenuesStrip venues={relatedVenues} region={venue.region} />
        ) : (
          <div className={venueListSection}>
            <Link href="/venues" className={venueListBtn}>
              查看全部場地
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
