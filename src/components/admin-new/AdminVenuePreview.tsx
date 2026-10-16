'use client';

import Image from 'next/image';
import { CheckIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import Skeleton from '@/components/ui/Skeleton';
import VenueSourceMeta from '@/components/venues/detailV2/components/VenueSourceMeta';
import type { AdminVenuePreview as PreviewData } from './adminVenueTagFields';
import type { TagDictionaryStatus } from './AdminVenueTagSection';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const wrapper = css({ display: 'flex', flexDirection: 'column', gap: '4' });

const title = css({ margin: 0, textStyle: 'h4', color: 'color.text.primary' });

const caption = css({ margin: 0, textStyle: 'caption', color: 'color.text.secondary' });

const card = css({
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  background: 'color.background.primary',
  boxShadow: 'shadow.sm',
});

const cover = css({
  position: 'relative',
  aspectRatio: '4 / 3',
  background: 'gray.100',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const cardBody = css({ padding: '3', display: 'flex', flexDirection: 'column', gap: '1' });

const cardName = css({
  margin: 0,
  textStyle: 'bodySmall',
  fontWeight: 'bold',
  color: 'color.text.primary',
});

const cardTags = css({ display: 'flex', flexWrap: 'wrap', gap: '1.5', marginTop: '1' });

const cardTag = css({
  paddingY: '0.5',
  paddingX: '2',
  borderRadius: 'radius.sm',
  background: 'gray.100',
  color: 'color.text.primary',
  textStyle: 'caption',
});

const usageBox = css({
  padding: '4',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

const usageHeading = css({
  margin: 0,
  textStyle: 'caption',
  fontWeight: 'bold',
  color: 'color.text.secondary',
});

const usageList = css({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'grid',
  gap: '3',
});

const usageItem = css({ display: 'flex', alignItems: 'flex-start', gap: '3' });

const checkDot = css({
  flexShrink: 0,
  width: '24px',
  height: '24px',
  borderRadius: 'radius.circle',
  background: 'stellarBlue.50',
  color: 'stellarBlue.700',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const usageTitle = css({ margin: 0, textStyle: 'bodyStrong', color: 'color.text.primary' });

const usageDesc = css({
  margin: 0,
  marginTop: '0.5',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const notes = css({
  paddingTop: '3',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
});

// ─── Component ────────────────────────────────────────────────────────────────

interface AdminVenuePreviewProps {
  status: TagDictionaryStatus;
  preview: PreviewData | null;
  name: string;
  region: string;
  nearestMrt: string;
  mrtWalkMinutes: string;
  coverPhoto: string;
  sourceLinks: string[];
  infoUpdatedOn: string | null;
}

function formatLocation(region: string, station: string, minutes: string): string {
  const mrt = station.trim() ? `${station.trim()}${minutes ? `步行 ${minutes} 分鐘` : ''}` : '';
  return [region, mrt].filter(Boolean).join('・');
}

export default function AdminVenuePreview({
  status,
  preview,
  name,
  region,
  nearestMrt,
  mrtWalkMinutes,
  coverPhoto,
  sourceLinks,
  infoUpdatedOn,
}: AdminVenuePreviewProps) {
  const location = formatLocation(region, nearestMrt, mrtWalkMinutes);

  return (
    <div className={wrapper}>
      <h2 className={title}>前台會這樣顯示</h2>

      {status === 'pending' && (
        <div aria-hidden="true" className={wrapper}>
          <Skeleton width="100%" height="240px" borderRadius="12px" />
          <Skeleton width="100%" height="160px" borderRadius="12px" />
        </div>
      )}
      {status === 'error' && <p className={caption}>標籤載入失敗，暫時無法預覽。</p>}

      {preview && (
        <>
          <p className={caption}>列表卡片（最多 3 個，照固定順序）</p>
          <div className={card}>
            <div className={cover}>
              {coverPhoto ? (
                <Image
                  src={coverPhoto}
                  alt=""
                  fill
                  sizes="360px"
                  unoptimized
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                '場地封面'
              )}
            </div>
            <div className={cardBody}>
              <p className={cardName}>{name.trim() || '場地名稱'}</p>
              {location && <p className={caption}>{location}</p>}
              {preview.cardTagLabels.length > 0 && (
                <div className={cardTags}>
                  {preview.cardTagLabels.map((label) => (
                    <span key={label} className={cardTag}>
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className={caption}>詳情頁「可以在這裡」</p>
          <div className={usageBox}>
            <h3 className={usageHeading}>可以在這裡</h3>
            {preview.usageRows.length > 0 ? (
              <ul className={usageList}>
                {preview.usageRows.map((row) => (
                  <li key={row.key} className={usageItem}>
                    <span className={checkDot} aria-hidden="true">
                      <CheckIcon width={14} height={14} strokeWidth={2.5} />
                    </span>
                    <div>
                      <p className={usageTitle}>{row.title}</p>
                      {row.description && <p className={usageDesc}>{row.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={caption}>
                沒有勾「應援物代發」「可佈置」「可包場」，詳情頁不會出現這個區塊。
              </p>
            )}
            <div className={notes}>
              <p className={caption}>沒列出的項目，也可以詢問店家討論。</p>
              <p className={caption}>費用依方案而定，以店家最新說明、私訊討論為準。</p>
              <VenueSourceMeta sourceLinks={sourceLinks} infoUpdatedOn={infoUpdatedOn} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
