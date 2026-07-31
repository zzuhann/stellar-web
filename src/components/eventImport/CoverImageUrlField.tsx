'use client';

import { useRef, useState } from 'react';
import { CoverImageFetchStatus } from './hooks/useCoverImageUrlFetch';
import {
  urlInputRow,
  urlInput,
  outlineButton,
  spinnerIcon,
  inlineHint,
  inlineError,
} from './styles';

interface CoverImageUrlFieldProps {
  status: CoverImageFetchStatus;
  errorMessage: string | null;
  onSubmit: (url: string) => void;
}

export default function CoverImageUrlField({
  status,
  errorMessage,
  onSubmit,
}: CoverImageUrlFieldProps) {
  const [url, setUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoading = status === 'loading';

  const submit = () => {
    const currentValue = inputRef.current?.value ?? url;
    if (!currentValue.trim()) return;
    onSubmit(currentValue);
    setUrl('');
  };

  return (
    <div>
      <div className={urlInputRow}>
        <input
          ref={inputRef}
          type="url"
          className={urlInput}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPaste={() => requestAnimationFrame(submit)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          disabled={isLoading}
          placeholder="貼上封面圖網址"
          aria-label="封面圖網址"
        />
        <button
          type="button"
          className={outlineButton()}
          onClick={submit}
          disabled={isLoading || !url.trim()}
        >
          {isLoading && (
            <span className={spinnerIcon} role="status" aria-hidden="true">
              <span className="sr-only">抓取中</span>
            </span>
          )}
          {isLoading ? '抓取中…' : '抓取'}
        </button>
      </div>

      {status === 'success' && <p className={inlineHint}>已從網址帶入，可直接修改</p>}
      {status === 'skipped' && (
        <p className={inlineHint}>
          封面圖已有值，這次貼上的網址不會套用；如需更換，請先移除目前的封面圖
        </p>
      )}
      {status === 'error' && errorMessage && (
        <p className={inlineError} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
