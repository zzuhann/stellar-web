'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { ImageQueueItem } from './hooks/useImageUrlQueue';
import {
  assistBoxDesc,
  captionTextarea,
  outlineButton,
  spinnerIcon,
  tileGrid,
  tile,
  tileImage,
  tileRemoveButton,
  tileErrorOverlay,
  tileErrorActions,
  tileSmallButton,
  tileErrorText,
} from './styles';
import { formGroup, label, helperText } from '@/components/submitEvent/styles';

interface DetailImageUrlSectionProps {
  items: ImageQueueItem[];
  onSubmitUrls: (urls: string[]) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function DetailImageUrlSection({
  items,
  onSubmitUrls,
  onRetry,
  onRemove,
}: DetailImageUrlSectionProps) {
  const [draft, setDraft] = useState('');
  const draftRef = useRef<HTMLTextAreaElement>(null);

  const handleAdd = () => {
    const urls = draft.split('\n');
    if (urls.every((url) => !url.trim())) return;
    onSubmitUrls(urls);
    setDraft('');
  };

  return (
    <div className={formGroup} role="group" aria-labelledby="detail-image-url-label">
      <label id="detail-image-url-label" className={label}>
        詳細圖片網址
      </label>
      <p className={assistBoxDesc}>
        除了封面圖以外，複製貼文中的其他圖片網址貼進來，伺服器會自動抓取並存進圖床
      </p>

      <textarea
        ref={draftRef}
        className={captionTextarea}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="貼上圖片網址，一行一個，可一次貼多筆"
        aria-label="詳細圖片網址（一行一個）"
      />
      <button
        type="button"
        className={outlineButton()}
        onClick={handleAdd}
        disabled={!draft.trim()}
      >
        新增圖片
      </button>

      {items.length > 0 && (
        <div className={tileGrid} role="list" aria-label="詳細圖片抓取結果">
          {items.map((item) => (
            <div key={item.id} className={tile} role="listitem">
              {item.status === 'loading' && (
                <div className={tileErrorOverlay} aria-live="polite">
                  <span className={spinnerIcon} role="status" aria-hidden="true">
                    <span className="sr-only">抓取中</span>
                  </span>
                </div>
              )}

              {item.status === 'success' && item.resultUrl && (
                <>
                  <Image
                    src={item.resultUrl}
                    alt="活動圖片"
                    fill
                    sizes="(min-width: 768px) 15vw, 30vw"
                    className={tileImage}
                  />
                  <button
                    type="button"
                    className={tileRemoveButton}
                    onClick={() => onRemove(item.id)}
                    aria-label="移除這張圖片"
                  >
                    <XMarkIcon width={16} height={16} aria-hidden="true" />
                  </button>
                </>
              )}

              {item.status === 'error' && (
                <>
                  <div className={tileErrorOverlay}>
                    <PhotoIcon
                      width={24}
                      height={24}
                      color="var(--color-text-secondary)"
                      aria-hidden="true"
                    />
                    <p className={tileErrorText} role="alert">
                      {item.errorMessage}
                    </p>
                  </div>
                  <div className={tileErrorActions}>
                    <button
                      type="button"
                      className={tileSmallButton({ variant: 'retry' })}
                      onClick={() => onRetry(item.id)}
                    >
                      重試
                    </button>
                    <button
                      type="button"
                      className={tileSmallButton({ variant: 'remove' })}
                      onClick={() => onRemove(item.id)}
                    >
                      移除
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <p className={helperText}>抓取失敗的圖片可以重試或移除，不影響其他已成功的圖片</p>
    </div>
  );
}
