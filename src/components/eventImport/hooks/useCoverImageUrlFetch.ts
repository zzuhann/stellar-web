'use client';

import { useCallback, useRef, useState } from 'react';
import { importApi } from '@/lib/api';
import { resolveFetchImageErrorMessage } from '../utils/imageFetchErrors';

export type CoverImageFetchStatus = 'idle' | 'loading' | 'success' | 'skipped' | 'error';

/**
 * 封面圖網址抓取：與詳細圖片網址不同，`mainImage` 是單一值，合併規則是「填空即可」。
 * 抓取一定會發生（伺服器一定被呼叫），套用與否要等回應當下才判斷目前欄位是否已有值
 * （design-frontend.md〈畫面規格〉第 5 點、〈Edge Cases〉：以回應當下為準）。
 */
export function useCoverImageUrlFetch(
  isCurrentlyEmpty: () => boolean,
  onApply: (url: string) => void
) {
  const [status, setStatus] = useState<CoverImageFetchStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 管理員可能連續貼上/重試多次；沒有這個序號防護的話，較舊、較晚回應的請求
  // 可能在較新一次請求已經有結果之後才回來，覆蓋掉較新的狀態。
  const requestSeqRef = useRef(0);

  const fetchUrl = useCallback(
    async (sourceUrl: string) => {
      const trimmed = sourceUrl.trim();
      if (!trimmed) return;

      const seq = (requestSeqRef.current += 1);
      setStatus('loading');
      setErrorMessage(null);

      try {
        const response = await importApi.fetchImage(trimmed);
        if (requestSeqRef.current !== seq) return; // 已被更新的請求取代，忽略這次回應

        if (!response.success) {
          setStatus('error');
          setErrorMessage(resolveFetchImageErrorMessage(response, undefined));
          return;
        }

        if (isCurrentlyEmpty()) {
          onApply(response.imageUrl);
          setStatus('success');
        } else {
          setStatus('skipped');
        }
      } catch {
        if (requestSeqRef.current !== seq) return;
        setStatus('error');
        setErrorMessage(resolveFetchImageErrorMessage(undefined, true));
      }
    },
    [isCurrentlyEmpty, onApply]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return { status, errorMessage, fetchUrl, reset };
}
