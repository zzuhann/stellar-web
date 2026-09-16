import { afterEach, describe, expect, it, vi } from 'vitest';
import { notifyUnauthorized, subscribeUnauthorized } from './auth-events';

// listeners 是模組層級的共用 state，測試間要主動清掉訂閱，避免互相汙染
const cleanups: Array<() => void> = [];
function subscribe(listener: () => void) {
  const unsubscribe = subscribeUnauthorized(listener);
  cleanups.push(unsubscribe);
  return unsubscribe;
}

describe('auth-events pub/sub', () => {
  afterEach(() => {
    cleanups.splice(0).forEach((unsubscribe) => unsubscribe());
  });

  it('訂閱後 notifyUnauthorized() 會呼叫到 listener', () => {
    const listener = vi.fn();
    subscribe(listener);

    notifyUnauthorized();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('取消訂閱後 notifyUnauthorized() 不會再呼叫到該 listener', () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    unsubscribe();
    notifyUnauthorized();

    expect(listener).not.toHaveBeenCalled();
  });

  it('多個 listener 同時訂閱時，notifyUnauthorized() 都會通知到', () => {
    const listenerA = vi.fn();
    const listenerB = vi.fn();
    subscribe(listenerA);
    subscribe(listenerB);

    notifyUnauthorized();

    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);
  });

  it('取消其中一個 listener 不影響其他 listener 繼續收到通知', () => {
    const listenerA = vi.fn();
    const listenerB = vi.fn();
    const unsubscribeA = subscribe(listenerA);
    subscribe(listenerB);

    unsubscribeA();
    notifyUnauthorized();

    expect(listenerA).not.toHaveBeenCalled();
    expect(listenerB).toHaveBeenCalledTimes(1);
  });
});
