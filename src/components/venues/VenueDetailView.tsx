'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { css } from '@/styled-system/css';
import type { Venue, VenueDetail } from '@/types';
import VenueGallery from './VenueGallery';
import InfoRow from './InfoRow';
import PastEventsStrip from './PastEventsStrip';
import RelatedVenuesStrip from './RelatedVenuesStrip';

const pageOuter = css({
  minHeight: '100vh',
  background: 'color.background.primary',
  paddingTop: '70px',
});

const page = css({
  maxWidth: '500px',
  margin: '0 auto',
  background: 'color.background.primary',
  paddingBottom: '40px',
  boxShadow: 'shadow.md',
});

const backBar = css({
  padding: '12px 16px 8px',
});

const backBtn = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '14px',
  color: 'color.text.primary',
  textDecoration: 'none',
  padding: '4px 0',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  fontWeight: 500,
  '&:hover': {
    color: 'color.primary',
  },
});

const titleSection = css({
  padding: '14px 16px 4px',
});

const typeAndCount = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '4px',
});

const typeTag = css({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '3px 8px',
  borderRadius: 'radius.sm',
  background: 'stellarBlue.50',
  color: 'stellarBlue.700',
  fontSize: '11px',
  fontWeight: 500,
});

const countBadge = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '11px',
  color: 'color.text.secondary',
  letterSpacing: '0.04em',
});

const venueName = css({
  margin: 0,
  fontSize: '22px',
  fontWeight: 700,
  color: 'color.text.primary',
  lineHeight: 1.3,
});

const regionRow = css({
  marginTop: '6px',
  fontSize: '13px',
  color: 'color.text.secondary',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const statsGrid = css({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px',
  marginTop: '14px',
});

const statBox = css({
  padding: '10px 12px',
  borderRadius: 'radius.lg',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
});

const statLabel = css({
  fontSize: '11px',
  color: 'color.text.secondary',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
});

const statValue = css({
  marginTop: '4px',
  fontSize: '22px',
  fontWeight: 700,
  color: 'color.text.primary',
  letterSpacing: '0.01em',
});

const statUnit = css({
  fontSize: '12px',
  color: 'color.text.secondary',
  fontWeight: 400,
});

const infoSection = css({
  padding: '20px 16px 8px',
});

const sectionTitle = css({
  margin: 0,
  fontSize: '15px',
  fontWeight: 700,
  color: 'color.text.primary',
});

const bookingSubtitle = css({
  margin: '4px 0 0',
  fontSize: '12px',
  color: 'color.text.secondary',
});

const bookingDescHint = css({
  margin: '8px 0 0',
  padding: '6px 10px',
  borderLeft: '3px solid',
  borderLeftColor: 'amber.400',
  fontSize: '12px',
  color: 'color.text.secondary',
  lineHeight: 1.5,
});

const tagsSection = css({
  padding: '12px 16px',
});

const tagsWrap = css({
  marginTop: '8px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
});

const tagPill = css({
  padding: '6px 10px',
  borderRadius: '999px',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  fontSize: '12px',
  color: 'color.text.primary',
  fontWeight: 500,
});

const descSection = css({
  padding: '12px 16px',
});

const descText = css({
  margin: '8px 0 0',
  fontSize: '14px',
  color: 'color.text.primary',
  lineHeight: 1.7,
  whiteSpace: 'pre-wrap',
});

const bookingSection = css({
  padding: '16px 16px 0',
});

const primaryBtn = css({
  padding: '11px 20px',
  borderRadius: 'radius.md',
  border: 'none',
  background: 'color.primary',
  color: 'white',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
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
  padding: '16px 16px 40px',
});

const venueListBtn = css({
  width: '100%',
  padding: '13px',
  borderRadius: 'radius.md',
  background: 'color.background.secondary',
  color: 'color.text.primary',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'color.border.light',
  fontSize: '14px',
  fontWeight: 500,
  display: 'block',
  textDecoration: 'none',
  textAlign: 'center',
  transition: 'all 0.15s ease',
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
  fontSize: '11px',
  fontWeight: 700,
  flexShrink: 0,
});

const pinIconWrapper = css({
  color: 'stellarBlue.500',
  display: 'inline-flex',
});

const starIconCls = css({
  color: 'amber.500',
});

const mapIconWrapper = css({
  color: 'gray.400',
  flexShrink: 0,
});

function PinIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function MrtIcon() {
  return <span className={mrtIconCls}>M</span>;
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function MapExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
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
          url: `https://www.instagram.com/${venue.socialMedia.instagram}`,
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

function buildSocialLink(venue: VenueDetail): { text: string; url: string } | null {
  const sm = venue.socialMedia;
  if (!sm) return null;
  if (sm.instagram) return { text: sm.instagram, url: `https://www.instagram.com/${sm.instagram}` };
  if (sm.threads) return { text: sm.threads, url: `https://www.threads.com/@${sm.threads}` };
  if (sm.line) return { text: sm.line, url: sm.line };
  return null;
}

interface VenueDetailViewProps {
  venue: VenueDetail;
  relatedVenues: Venue[];
}

export default function VenueDetailView({ venue, relatedVenues }: VenueDetailViewProps) {
  const router = useRouter();
  const photos = [venue.coverPhoto, ...(venue.otherPhotos ?? [])].filter(Boolean) as string[];
  const socialLink = buildSocialLink(venue);
  const bookingChannel = buildBookingChannel(venue);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}&query_place_id=${venue.placeId}`;

  return (
    <div className={pageOuter}>
      <div className={page}>
        <div className={backBar}>
          <button type="button" className={backBtn} onClick={() => router.back()}>
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 6-6 6 6 6" />
            </svg>
            場地列表
          </button>
        </div>

        <VenueGallery photos={photos} venueName={venue.name} />

        <section className={titleSection}>
          <div className={typeAndCount}>
            <span className={typeTag}>{venue.region}</span>
            <span className={countBadge}>
              <svg
                aria-hidden="true"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={starIconCls}
              >
                <path d="M12 3 14.5 9 21 10l-5 4.5 1.5 6.5L12 17.5 6.5 21 8 14.5 3 10l6.5-1z" />
              </svg>
              收錄 {venue.eventCount} 場生咖
            </span>
          </div>
          <h1 className={venueName}>{venue.name}</h1>
          <div className={regionRow}>
            <span className={pinIconWrapper}>
              <PinIcon />
            </span>
            {venue.region}
          </div>

          <div className={statsGrid}>
            <div className={statBox}>
              <div className={statLabel}>容納人數</div>
              <div className={statValue}>
                {venue.capacityRange ? (
                  <>
                    {venue.capacityRange} <span className={statUnit}>人</span>
                  </>
                ) : (
                  <span className={statUnit}>未提供</span>
                )}
              </div>
            </div>
            <div className={statBox}>
              <div className={statLabel}>平台生咖</div>
              <div className={statValue}>
                {venue.eventCount} <span className={statUnit}>場</span>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="基本資訊" className={infoSection}>
          <h2 className={sectionTitle}>基本資訊</h2>
          <div style={{ marginTop: '4px' }}>
            <InfoRow
              icon={<PinIcon />}
              label="地址"
              value={
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {venue.address}
                  <span className={mapIconWrapper}>
                    <MapExternalIcon />
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
                icon={<InstagramIcon />}
                label="社群"
                value={
                  <a
                    href={socialLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {socialLink.text}
                    <span className={mapIconWrapper}>
                      <MapExternalIcon />
                    </span>
                    <span className="sr-only">（開新分頁）</span>
                  </a>
                }
              />
            )}
          </div>
        </section>

        {venue.hostTags && venue.hostTags.length > 0 && (
          <section aria-label="設備與服務" className={tagsSection}>
            <h2 className={sectionTitle}>設備與服務</h2>
            <div className={tagsWrap}>
              {venue.hostTags.map((tag) => (
                <span key={tag} className={tagPill}>
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {bookingChannel && (
          <section aria-label="聯繫這個場地" className={bookingSection}>
            <h2 className={sectionTitle}>聯繫這個場地</h2>
            <p className={bookingSubtitle}>請依場地規定確認預約步驟</p>
            {venue.description && (
              <p className={bookingDescHint}>
                此場地有填寫說明，預約前建議先閱讀下方「其他說明」。
              </p>
            )}
            <div style={{ marginTop: '10px', display: 'flex' }}>
              <a
                href={bookingChannel.url}
                target="_blank"
                rel="noopener noreferrer"
                className={primaryBtn}
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
