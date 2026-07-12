import Image from 'next/image';
import { CheckIcon, EyeIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Artist, CoffeeEvent } from '@/types';

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
    <article className="overflow-hidden rounded-stellar-xl border border-line bg-surface shadow-stellar-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-stellar-md motion-reduce:transform-none">
      <div className="relative aspect-[4/3] bg-neutral-subtle">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(min-width: 1024px) 30vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-content-disabled">
            沒有圖片
          </div>
        )}
        <label className="absolute left-3 top-3 flex size-11 cursor-pointer items-center justify-center rounded-stellar-xl bg-surface/95 shadow-stellar-sm">
          <span className="sr-only">選擇 {name}</span>
          <input
            type="checkbox"
            checked={selected}
            disabled={busy}
            onChange={(event) => onSelect(event.target.checked)}
            className="size-5 accent-brand"
          />
        </label>
      </div>
      <div className="space-y-1 px-5 py-4">
        <h3 className="line-clamp-1 text-base font-semibold text-content">{name}</h3>
        <p className="line-clamp-1 text-sm text-content-muted">{subtitle}</p>
        <p className="pt-1 text-xs tabular-nums text-content-disabled">
          投稿於 {formatCreatedAt(item.createdAt)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
        {artist ? (
          <button type="button" onClick={onEdit} className="review-secondary-button">
            <PencilSquareIcon className="size-4" />
            編輯
          </button>
        ) : (
          <button type="button" onClick={onPreview} className="review-secondary-button">
            <EyeIcon className="size-4" />
            預覽
          </button>
        )}
        <button type="button" onClick={onApprove} disabled={busy} className="review-approve-button">
          <CheckIcon className="size-4" />
          通過
        </button>
        {artist && (
          <button type="button" onClick={onExists} disabled={busy} className="review-exists-button">
            已存在
          </button>
        )}
        <button type="button" onClick={onReject} disabled={busy} className="review-reject-button">
          <XMarkIcon className="size-4" />
          拒絕
        </button>
      </div>
    </article>
  );
}
