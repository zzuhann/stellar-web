'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export type RouterMethod = 'replace' | 'push';

export interface SetQueryStateOptions {
  pathname?: string;
  method?: RouterMethod;
}

export interface QueryStateContextValue {
  setState: (key: string, value: unknown, options?: SetQueryStateOptions) => void;
  mergeUpdates: (fn: () => void, method?: RouterMethod) => void;
  params: Record<string, string>;
}

const QueryStateContext = createContext<QueryStateContextValue | null>(null);

function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

function stringifyValue(value: unknown): string {
  if (value instanceof Date) {
    // 使用本地時區的日期，避免 UTC 轉換問題
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

export function QueryStateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const shouldMerge = useRef(false);
  const paramsToMerge = useRef<Record<string, unknown>>({});

  // 記錄透過 setState 設定但 URL 還未更新的值
  // （in-app browser / PWA 中 router.replace 不會觸發 searchParams 更新）
  const [pendingOverrides, setPendingOverrides] = useState<Record<string, string | null>>({});
  const [prevSearchParams, setPrevSearchParams] = useState(searchParams);

  // Render-time derived state：偵測 URL 外部變化（瀏覽器上下頁）
  // React 認可的 getDerivedStateFromProps 等價模式，不需 useEffect
  if (prevSearchParams !== searchParams) {
    setPrevSearchParams(searchParams);
    setPendingOverrides({});
  }

  // params = URL 值 + pendingOverrides 覆蓋
  const params = useMemo(() => {
    const base: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      base[key] = value;
    });
    Object.entries(pendingOverrides).forEach(([key, value]) => {
      if (value !== null) {
        base[key] = value;
      } else {
        delete base[key];
      }
    });
    return base;
  }, [searchParams, pendingOverrides]);

  const setState: QueryStateContextValue['setState'] = useCallback(
    (key, value, { pathname: optionPathname, method = 'replace' } = {}) => {
      if (shouldMerge.current) {
        paramsToMerge.current[key] = value;
        return;
      }

      // 立即更新 pendingOverrides，確保 in-app browser 也能正常 re-render
      setPendingOverrides((prev) => {
        const next = { ...prev };
        next[key] = isNonNullable(value) ? stringifyValue(value) : null;
        return next;
      });

      const current = new URLSearchParams(searchParams.toString());

      if (isNonNullable(value)) {
        current.set(key, stringifyValue(value));
      } else {
        current.delete(key);
      }

      const search = current.toString();
      const newUrl = search
        ? `${optionPathname ?? pathname}?${search}`
        : (optionPathname ?? pathname);
      router[method](newUrl, { scroll: false });
    },
    [router, searchParams, pathname]
  );

  const mergeUpdates: QueryStateContextValue['mergeUpdates'] = useCallback(
    (fn, method = 'replace') => {
      shouldMerge.current = true;
      paramsToMerge.current = {};

      fn(); // Execute all the setState calls

      const updates = { ...paramsToMerge.current };

      // 批次更新 pendingOverrides
      setPendingOverrides((prev) => {
        const next = { ...prev };
        Object.entries(updates).forEach(([key, value]) => {
          next[key] = isNonNullable(value) ? stringifyValue(value) : null;
        });
        return next;
      });

      const current = new URLSearchParams(searchParams.toString());

      // Apply all merged updates
      Object.entries(updates).forEach(([key, value]) => {
        if (isNonNullable(value)) {
          current.set(key, stringifyValue(value));
        } else {
          current.delete(key);
        }
      });

      const search = current.toString();
      const newUrl = search ? `${pathname}?${search}` : pathname;
      router[method](newUrl, { scroll: false });

      shouldMerge.current = false;
    },
    [router, searchParams, pathname]
  );

  const value = useMemo(
    (): QueryStateContextValue => ({
      setState,
      mergeUpdates,
      params,
    }),
    [setState, mergeUpdates, params]
  );

  return <QueryStateContext.Provider value={value}>{children}</QueryStateContext.Provider>;
}

export function useQueryStateContext() {
  const context = useContext(QueryStateContext);
  if (!context) {
    throw new Error('useQueryState must be used within a QueryStateProvider');
  }
  return context;
}

export function useQueryStateContextMergeUpdates() {
  const { mergeUpdates } = useQueryStateContext();
  return { mergeUpdates };
}
