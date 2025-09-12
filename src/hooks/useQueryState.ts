'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQueryStateContext, RouterMethod, SetQueryStateOptions } from './useQueryStateContext';

interface Options<T> {
  parse?: (value: string) => T;
  defaultValue?: T;
  defaultMethod?: RouterMethod;
}

type UseQueryStateReturn<T, D> = [
  D extends undefined ? T | null : D,
  (value: null | T, options?: SetQueryStateOptions) => void,
];

// Overloads for better TypeScript support
export function useQueryState<T = string>(
  name: string,
  options: Options<T> & { defaultValue: T }
): UseQueryStateReturn<T, typeof options.defaultValue>;

export function useQueryState<T = string>(
  name: string,
  options?: Options<T>
): UseQueryStateReturn<T, undefined>;

export function useQueryState<T = string>(
  name: string,
  { parse = parseAsString as () => T, defaultValue, defaultMethod = 'replace' }: Options<T> = {}
): UseQueryStateReturn<T, typeof defaultValue> {
  const { setState } = useQueryStateContext();
  const searchParams = useSearchParams();
  const rawValue = searchParams.get(name);

  const value = useMemo(() => {
    if (rawValue === null) return defaultValue;
    try {
      return parse(rawValue);
    } catch {
      return defaultValue;
    }
  }, [rawValue, defaultValue, parse]);

  const setValue: UseQueryStateReturn<T, typeof defaultValue>[1] = useCallback(
    (value, options) => {
      setState(name, value, { ...options, method: options?.method ?? defaultMethod });
    },
    [defaultMethod, name, setState]
  );

  return [value as any, setValue];
}

// Parse functions
export function parseAsString(value: string): string {
  try {
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded);
  } catch {
    return value;
  }
}

export function parseAsBoolean(value: string): boolean {
  return value === 'true';
}

export function parseAsFloat(value: string): number {
  return parseFloat(value);
}

export function parseAsInt(value: string): number {
  return parseInt(value, 10);
}

export function parseAsObject<T>(value: string): T | null {
  try {
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function parseAsDate(value: string): Date {
  return new Date(value);
}

// Custom parser for getWeekStart dates
export function parseAsWeekStart(value: string): Date {
  try {
    const date = new Date(value);
    // You'll need to import getWeekStart here
    // return getWeekStart(date);
    return date;
  } catch {
    return new Date();
  }
}
