import type { VenueDetail } from '@/types';
import { cleanSocialMediaHandle } from './socialMedia';

export type VenueContactSource = Pick<
  VenueDetail,
  'name' | 'socialMedia' | 'preferredContact' | 'contactUrl' | 'bookingFormUrl'
>;

export type VenueContactChannel = 'instagram' | 'threads' | 'line';

export interface VenueContact {
  // Also the contact_type sent on click: the channel actually used, not preferredContact
  channel: VenueContactChannel;
  url: string;
  labelParts: { before: string; name: string; after: string };
  bookingFormUrl: string | null;
}

const instagramUrl = (handle: string) => `https://www.instagram.com/${handle}`;
const threadsUrl = (handle: string) => `https://www.threads.com/@${handle}`;

// New-layout contact; production VenueDetailView keeps its own buildBookingChannel until the swap
export const buildVenueContact = (venue: VenueContactSource): VenueContact | null => {
  const ig = cleanSocialMediaHandle(venue.socialMedia?.instagram ?? '');
  const threads = cleanSocialMediaHandle(venue.socialMedia?.threads ?? '');

  let resolved: { channel: VenueContactChannel; url: string } | null = null;
  switch (venue.preferredContact) {
    case 'instagram':
      if (ig) resolved = { channel: 'instagram', url: instagramUrl(ig) };
      break;
    case 'threads':
      if (threads) resolved = { channel: 'threads', url: threadsUrl(threads) };
      break;
    case 'line':
      if (venue.contactUrl) resolved = { channel: 'line', url: venue.contactUrl };
      break;
    default:
      // Legacy form/other (or unset) is treated as "not chosen": fall back to IG, then Threads
      if (ig) resolved = { channel: 'instagram', url: instagramUrl(ig) };
      else if (threads) resolved = { channel: 'threads', url: threadsUrl(threads) };
  }
  if (!resolved) return null;

  const labelParts =
    resolved.channel === 'line'
      ? { before: '用 LINE 聯絡 ', name: venue.name, after: '' }
      : {
          before: '私訊 ',
          name: venue.name,
          after: resolved.channel === 'instagram' ? '（Instagram）' : '（Threads）',
        };

  return {
    ...resolved,
    labelParts,
    bookingFormUrl: venue.bookingFormUrl?.trim() || null,
  };
};

export interface VenueSocialLink {
  text: string;
  url: string;
  type: 'instagram' | 'threads' | 'line';
}

// Same rule as the production page's social row; duplicated so VenueDetailView stays untouched
export const buildVenueSocialLink = (
  venue: Pick<VenueDetail, 'socialMedia'>
): VenueSocialLink | null => {
  const sm = venue.socialMedia;
  if (!sm) return null;
  const ig = cleanSocialMediaHandle(sm.instagram ?? '');
  const threads = cleanSocialMediaHandle(sm.threads ?? '');
  if (ig) return { text: `@${ig}`, url: instagramUrl(ig), type: 'instagram' };
  if (threads) return { text: `@${threads}`, url: threadsUrl(threads), type: 'threads' };
  if (sm.line) return { text: sm.line, url: sm.line, type: 'line' };
  return null;
};
