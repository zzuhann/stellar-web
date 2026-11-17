import { useRef, useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// null on the server and during hydration (matches ISR HTML), the browser's current time after.
// The value is fixed per mounted component, so a remount reads a fresh time (see isr-cache-invalidation.md).
export function useClientNow(): Date | null {
  const cached = useRef<Date | null>(null);
  return useSyncExternalStore(
    subscribe,
    () => (cached.current ??= new Date()),
    () => null
  );
}
