'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { css } from '@/styled-system/css';
import type { VenueDetail } from '@/types';
import VenueGallery from './VenueGallery';
import InfoRow from './InfoRow';
import PastEventsStrip from './PastEventsStrip';

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

const mapsBtn = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: '12px',
  padding: '8px 14px',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'color.background.primary',
  color: 'color.text.primary',
  fontSize: '13px',
  fontWeight: 500,
  textDecoration: 'none',
  transition: 'all 0.15s ease',
  '&:hover': {
    borderColor: 'color.primary',
    color: 'color.primary',
  },
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
  width: '100%',
  padding: '13px',
  borderRadius: 'radius.md',
  border: 'none',
  background: 'color.primary',
  color: 'white',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: '0.04em',
  display: 'block',
  textDecoration: 'none',
  textAlign: 'center',
  transition: 'background 0.15s ease',
  '&:hover': {
    background: 'color.primaryHover',
  },
});

const outlineBtn = css({
  marginTop: '8px',
  width: '100%',
  padding: '13px',
  borderRadius: 'radius.md',
  background: 'color.background.primary',
  color: 'color.primary',
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'color.primary',
  fontSize: '14px',
  fontWeight: 500,
  display: 'block',
  textDecoration: 'none',
  textAlign: 'center',
  transition: 'all 0.15s ease',
  '&:hover': {
    background: 'stellarBlue.50',
  },
});

const submitSection = css({
  padding: '20px 16px 0',
});

const submitBtn = css({
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
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        background: 'var(--colors-stellar-blue-500)',
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      M
    </span>
  );
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

function MapPinIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
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

interface BookingChannel {
  label: string;
  url: string;
}

function buildBookingChannels(venue: VenueDetail): BookingChannel[] {
  const channels: BookingChannel[] = [];
  if (venue.contactUrl) {
    channels.push({ label: '前往預約表單', url: venue.contactUrl });
  }
  if (venue.socialMedia?.line) {
    channels.push({ label: '透過 LINE 聯絡', url: venue.socialMedia.line });
  }
  if (venue.socialMedia?.instagram) {
    channels.push({ label: '透過 IG 私訊預約', url: venue.socialMedia.instagram });
  }
  if (venue.socialMedia?.threads) {
    channels.push({ label: '透過 Threads 私訊預約', url: venue.socialMedia.threads });
  }
  return channels;
}

function buildSocialText(venue: VenueDetail): string | null {
  const sm = venue.socialMedia;
  if (!sm) return null;
  return sm.instagram || sm.threads || sm.line || null;
}

interface VenueDetailViewProps {
  venue: VenueDetail;
}

export default function VenueDetailView({ venue }: VenueDetailViewProps) {
  const router = useRouter();
  const photos = [venue.coverPhoto, ...(venue.otherPhotos ?? [])].filter(Boolean) as string[];
  const socialText = buildSocialText(venue);
  const bookingChannels = buildBookingChannels(venue);
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
            場地
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
                style={{ color: 'var(--colors-amber-500)' }}
              >
                <path d="M12 3 14.5 9 21 10l-5 4.5 1.5 6.5L12 17.5 6.5 21 8 14.5 3 10l6.5-1z" />
              </svg>
              辦過 {venue.eventCount} 場生咖
            </span>
          </div>
          <h1 className={venueName}>{venue.name}</h1>
          <div className={regionRow}>
            <span style={{ color: 'var(--colors-stellar-blue-500)', display: 'inline-flex' }}>
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
              <div className={statLabel}>過往生咖</div>
              <div className={statValue}>
                {venue.eventCount} <span className={statUnit}>場</span>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="基本資訊" className={infoSection}>
          <h2 className={sectionTitle}>基本資訊</h2>
          <div style={{ marginTop: '4px' }}>
            <InfoRow icon={<PinIcon />} label="地址" value={venue.address} />
            {venue.nearestMrt && (
              <InfoRow
                icon={<MrtIcon />}
                label="捷運"
                value={`${venue.nearestMrt}${venue.mrtWalkMinutes ? ` · 步行 ${venue.mrtWalkMinutes} 分鐘` : ''}`}
              />
            )}
            {socialText && <InfoRow icon={<InstagramIcon />} label="社群" value={socialText} />}
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={mapsBtn}>
            <MapPinIcon />在 Google Maps 開啟
            <span className="sr-only">（開新分頁）</span>
          </a>
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

        {venue.description && (
          <section aria-label="其他說明" className={descSection}>
            <h2 className={sectionTitle}>其他說明</h2>
            <p className={descText}>{venue.description}</p>
          </section>
        )}

        {bookingChannels.length > 0 && (
          <section aria-label="預約方式" className={bookingSection}>
            <h2 className={sectionTitle}>預約方式</h2>
            <div style={{ marginTop: '10px' }}>
              {bookingChannels.map((ch, i) => (
                <a
                  key={ch.url}
                  href={ch.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={i === 0 ? primaryBtn : outlineBtn}
                >
                  {ch.label}
                  <span className="sr-only">（開新分頁）</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {venue.events && venue.events.length > 0 && <PastEventsStrip events={venue.events} />}

        <div className={submitSection}>
          <Link href="/submit-event" className={submitBtn}>
            投稿活動到這個場地
          </Link>
        </div>
      </div>
    </div>
  );
}
