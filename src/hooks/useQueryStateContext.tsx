'use client';

import { createContext, useContext, useCallback, useMemo, ReactNode, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export type RouterMethod = 'replace' | 'push';

export interface SetQueryStateOptions {
  pathname?: string;
  method?: RouterMethod;
}

export interface QueryStateContextValue {
  setState: (key: string, value: unknown, options?: SetQueryStateOptions) => void;
  mergeUpdates: (fn: () => void, method?: RouterMethod) => void;
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

  const setState: QueryStateContextValue['setState'] = useCallback(
    (key, value, { pathname: optionPathname, method = 'replace' } = {}) => {
      if (shouldMerge.current) {
        paramsToMerge.current[key] = value;
        return;
      }

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

      const current = new URLSearchParams(searchParams.toString());

      // Apply all merged updates
      Object.entries(paramsToMerge.current).forEach(([key, value]) => {
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
    }),
    [setState, mergeUpdates]
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
