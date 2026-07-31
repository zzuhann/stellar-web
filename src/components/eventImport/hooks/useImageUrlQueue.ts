'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const itemsRef = useRef<ImageQueueItem[]>([]);
  const idCounterRef = useRef(0);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const runFetch = useCallback((id: string, sourceUrl: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'loading', errorMessage: undefined } : item
      )
    );

    importApi
      .fetchImage(sourceUrl)
      .then((response) => {
        setItems((prev) =>
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
        setItems((prev) =>
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
  }, []);

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

      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((item) => runFetch(item.id, item.sourceUrl));
    },
    [runFetch]
  );

  const retry = useCallback(
    (id: string) => {
      const target = itemsRef.current.find((item) => item.id === id);
      if (target) runFetch(id, target.sourceUrl);
    },
    [runFetch]
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const successUrls = items
    .map((item) => item.resultUrl)
    .filter((url): url is string => typeof url === 'string');

  return { items, successUrls, enqueue, retry, remove };
}
