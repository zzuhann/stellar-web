'use client';

import { useCallback, useRef, useState } from 'react';
import { importApi } from '@/lib/api';
import { resolveFetchImageErrorMessage } from '../utils/imageFetchErrors';

export type ImageQueueItemStatus = 'loading' | 'success' | 'error';

export interface ImageQueueItem {
  id: string;
  sourceUrl: string;
  status: ImageQueueItemStatus;
  resultUrl?: string;
  errorMessage?: string;
}

/**
 * 「詳細圖片網址」佇列：貼上多筆網址後，每筆各自獨立抓取、獨立呈現結果，
 * 失敗可重試或移除，不因為同批有失敗項目擋下其他項目
 * （design-frontend.md〈畫面規格〉第 5 點、qa.md〈部分圖片失敗〉）。
 */
export function useImageUrlQueue() {
  const [items, setItems] = useState<ImageQueueItem[]>([]);
  // 實際的 source of truth（見下方 `updateItems`）：每次異動都同步寫入，讀取不需要
  // 等 React 排程 re-render，確保同一個事件處理常式內連續呼叫（例如 remove 後緊接著
  // retry 同一個 id）也讀得到最新狀態。
  const itemsRef = useRef<ImageQueueItem[]>([]);
  const idCounterRef = useRef(0);
  // 每個 id 目前「有效」的請求序號：重試可能在前一次回應還沒回來前就再次觸發，
  // 沒有這層防護的話，較舊、較晚回應的請求可能覆蓋掉較新一次重試的結果。
  const requestSeqRef = useRef<Map<string, number>>(new Map());

  // `itemsRef` 是實際的 source of truth：從它（不是 React state 的 `prev` 參數）算出下一個
  // 陣列並立刻同步寫入，不依賴 setState updater 何時被 React 排程執行——setState 的批次處理
  // 時機不保證跟這行程式碼同步，若靠它來同步 ref 會有短暫但真實存在的空窗期。
  // `setItems` 這裡純粹是為了觸發重新渲染，不參與資料正確性的判斷。
  const updateItems = useCallback((updater: (prev: ImageQueueItem[]) => ImageQueueItem[]) => {
    const next = updater(itemsRef.current);
    itemsRef.current = next;
    setItems(next);
  }, []);

  const runFetch = useCallback(
    (id: string, sourceUrl: string) => {
      const seq = (requestSeqRef.current.get(id) ?? 0) + 1;
      requestSeqRef.current.set(id, seq);

      updateItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'loading', errorMessage: undefined } : item
        )
      );

      importApi
        .fetchImage(sourceUrl)
        .then((response) => {
          if (requestSeqRef.current.get(id) !== seq) return; // 已被更新的請求取代或已移除，忽略
          updateItems((prev) =>
            prev.map((item) => {
              if (item.id !== id) return item;
              if (response.success) {
                return {
                  ...item,
                  status: 'success',
                  resultUrl: response.imageUrl,
                  errorMessage: undefined,
                };
              }
              return {
                ...item,
                status: 'error',
                errorMessage: resolveFetchImageErrorMessage(response, undefined),
              };
            })
          );
        })
        .catch(() => {
          if (requestSeqRef.current.get(id) !== seq) return;
          updateItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: 'error',
                    errorMessage: resolveFetchImageErrorMessage(undefined, true),
                  }
                : item
            )
          );
        });
    },
    [updateItems]
  );

  const enqueue = useCallback(
    (rawUrls: string[]) => {
      const urls = rawUrls.map((url) => url.trim()).filter(Boolean);
      if (urls.length === 0) return;

      const newItems: ImageQueueItem[] = urls.map((sourceUrl) => {
        idCounterRef.current += 1;
        return {
          id: `detail-image-${idCounterRef.current}`,
          sourceUrl,
          status: 'loading' as const,
        };
      });

      updateItems((prev) => [...prev, ...newItems]);
      newItems.forEach((item) => runFetch(item.id, item.sourceUrl));
    },
    [runFetch, updateItems]
  );

  const retry = useCallback(
    (id: string) => {
      const target = itemsRef.current.find((item) => item.id === id);
      if (target) runFetch(id, target.sourceUrl);
    },
    [runFetch]
  );

  const remove = useCallback(
    (id: string) => {
      requestSeqRef.current.delete(id);
      updateItems((prev) => prev.filter((item) => item.id !== id));
    },
    [updateItems]
  );

  const successUrls = items
    .map((item) => item.resultUrl)
    .filter((url): url is string => typeof url === 'string');

  return { items, successUrls, enqueue, retry, remove };
}
