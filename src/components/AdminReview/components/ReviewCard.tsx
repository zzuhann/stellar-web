import Image from 'next/image';
import { CheckIcon, EyeIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import type { Artist, CoffeeEvent } from '@/types';
import { reviewButton } from './reviewButtonStyles';

interface ReviewCardProps {
  item: Artist | CoffeeEvent;
  selected: boolean;
  busy: boolean;
  onSelect: (selected: boolean) => void;
  onEdit?: () => void;
  onPreview?: () => void;
  onApprove: () => void;
  onExists?: () => void;
  onReject: () => void;
}

const isArtist = (item: Artist | CoffeeEvent): item is Artist => 'stageName' in item;

const formatCreatedAt = (value: Artist['createdAt'] | CoffeeEvent['createdAt']) => {
  if (typeof value === 'string') return new Date(value).toLocaleString('zh-TW');
  return new Date(value._seconds * 1000).toLocaleString('zh-TW');
};

const card = css({
  overflow: 'hidden',
  borderRadius: 'radius.xl',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  boxShadow: 'shadow.sm',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: 'shadow.md',
  },
});

const imageWrapper = css({
  position: 'relative',
  aspectRatio: '4 / 3',
  background: 'gray.100',
});

const noImageText = css({
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 'sm',
  color: 'color.text.disabled',
});

const checkboxLabel = css({
  position: 'absolute',
  left: '3',
  top: '3',
  display: 'flex',
  width: '44px',
  height: '44px',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'radius.xl',
  background: 'alpha.white.90',
  boxShadow: 'shadow.sm',
});

const checkboxInput = css({
  width: '20px',
  height: '20px',
  accentColor: 'color.primary',
});

const cardBody = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
  paddingX: '5',
  paddingY: '4',
});

const cardName = css({
  overflow: 'hidden',
  display: '-webkit-box',
  lineClamp: 1,
  fontSize: 'base',
  fontWeight: 'semibold',
  color: 'color.text.primary',
});

const cardSubtitle = css({
  overflow: 'hidden',
  display: '-webkit-box',
  lineClamp: 1,
  fontSize: 'sm',
  color: 'color.text.secondary',
});

const cardMeta = css({
  paddingTop: '1',
  fontSize: 'xs',
  fontVariantNumeric: 'tabular-nums',
  color: 'color.text.disabled',
});

const actionsRow = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  paddingX: '4',
  paddingY: '3',
});

const iconSize = css({ width: '16px', height: '16px' });

export default function ReviewCard({
  item,
  selected,
  busy,
  onSelect,
  onEdit,
  onPreview,
  onApprove,
  onExists,
  onReject,
}: ReviewCardProps) {
  const artist = isArtist(item);
  const name = artist ? item.stageNameZh || item.stageName : item.title;
  const subtitle = artist ? item.stageName : item.artists.map(({ name }) => name).join('、');
  const image = artist ? item.profileImage : item.mainImage;

  return (
    <article className={card}>
      <div className={imageWrapper}>
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(min-width: 1024px) 30vw, 100vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className={noImageText}>沒有圖片</div>
        )}
        <label className={checkboxLabel}>
          <span className="sr-only">選擇 {name}</span>
          <input
            type="checkbox"
            checked={selected}
            disabled={busy}
            onChange={(event) => onSelect(event.target.checked)}
            className={checkboxInput}
          />
        </label>
      </div>
      <div className={cardBody}>
        <h3 className={cardName}>{name}</h3>
        <p className={cardSubtitle}>{subtitle}</p>
        <p className={cardMeta}>投稿於 {formatCreatedAt(item.createdAt)}</p>
      </div>
      <div className={actionsRow}>
        {artist ? (
          <button type="button" onClick={onEdit} className={reviewButton({ kind: 'secondary' })}>
            <PencilSquareIcon className={iconSize} />
            編輯
          </button>
        ) : (
          <button type="button" onClick={onPreview} className={reviewButton({ kind: 'secondary' })}>
            <EyeIcon className={iconSize} />
            預覽
          </button>
        )}
        <button
          type="button"
          onClick={onApprove}
          disabled={busy}
          className={reviewButton({ kind: 'approve' })}
        >
          <CheckIcon className={iconSize} />
          通過
        </button>
        {artist && (
          <button
            type="button"
            onClick={onExists}
            disabled={busy}
            className={reviewButton({ kind: 'exists' })}
          >
            已存在
          </button>
        )}
        <button
          type="button"
          onClick={onReject}
          disabled={busy}
          className={reviewButton({ kind: 'reject' })}
        >
          <XMarkIcon className={iconSize} />
          拒絕
        </button>
      </div>
    </article>
  );
}
