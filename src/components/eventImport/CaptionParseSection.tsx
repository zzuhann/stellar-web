'use client';

import { useRef } from 'react';
import {
  assistBox,
  assistBoxTitle,
  assistBoxDesc,
  captionTextarea,
  outlineButton,
  spinnerIcon,
  inlineError,
  inlineHint,
  artistReferenceText,
} from './styles';

interface CaptionParseSectionProps {
  value: string;
  onChange: (value: string) => void;
  onParse: (caption: string) => void;
  isParsing: boolean;
  errorMessage: string | null;
  detectedArtistName: string | null;
}

export default function CaptionParseSection({
  value,
  onChange,
  onParse,
  isParsing,
  errorMessage,
  detectedArtistName,
}: CaptionParseSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 貼上（paste）自動觸發解析：等瀏覽器完成貼上、value 更新後再讀取最終內容
  // （design-frontend.md〈畫面規格〉第 1 點）。
  const handlePaste = () => {
    requestAnimationFrame(() => {
      const pastedValue = textareaRef.current?.value ?? '';
      if (pastedValue.trim()) onParse(pastedValue);
    });
  };

  const handleManualParse = () => {
    if (value.trim()) onParse(value);
  };

  return (
    <section className={assistBox} aria-labelledby="caption-parse-title">
      <h2 id="caption-parse-title" className={assistBoxTitle}>
        貼上貼文文案
      </h2>
      <p className={assistBoxDesc}>
        從 IG 或 Threads
        貼文複製整段文案，貼進下方文字框，系統會自動整理標題、日期、地點與社群帳號，可分次貼多篇
      </p>

      <textarea
        ref={textareaRef}
        className={captionTextarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        disabled={isParsing}
        placeholder="貼上貼文文案原文……"
        aria-label="貼文文案原文"
        aria-describedby={errorMessage ? 'caption-parse-error' : 'caption-parse-hint'}
      />

      <button
        type="button"
        className={outlineButton()}
        onClick={handleManualParse}
        disabled={isParsing || !value.trim()}
      >
        {isParsing && (
          <span className={spinnerIcon} role="status" aria-hidden="true">
            <span className="sr-only">解析中</span>
          </span>
        )}
        {isParsing ? '解析中…' : '解析'}
      </button>

      {isParsing && (
        <p id="caption-parse-hint" className={inlineHint} aria-live="polite">
          正在解析文案內容，通常在 5–10 秒內完成
        </p>
      )}

      {!isParsing && errorMessage && (
        <p id="caption-parse-error" className={inlineError} role="alert">
          {errorMessage}
        </p>
      )}

      {detectedArtistName && (
        <p className={artistReferenceText}>
          文案中偵測到的藝人（僅供參考）：{detectedArtistName} — 請至下方手動選擇
        </p>
      )}
    </section>
  );
}
