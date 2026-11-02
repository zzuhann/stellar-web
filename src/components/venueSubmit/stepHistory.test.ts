import { describe, expect, it, vi } from 'vitest';
import {
  DEPTH_KEY,
  jumpBackToStep,
  pushStep,
  readStateDepth,
  restoreDepth,
  returnToEntry,
} from './stepHistory';

function fakeHistory(state: unknown) {
  const history = {
    state,
    go: vi.fn<(delta?: number) => void>(),
    pushState: vi.fn((next: unknown, _unused: string, _url?: string | URL | null) => {
      history.state = next;
    }),
    replaceState: vi.fn((next: unknown, _unused: string, _url?: string | URL | null) => {
      history.state = next;
    }),
  };
  return history;
}

describe('TC-133 depth 的來源與退路', () => {
  it('a：history.state 沒有 depth、暫存的 depth 是 2 → replaceState 補回 2，不當成 0', () => {
    const history = fakeHistory({ __NA: true, other: 'kept' });
    expect(restoreDepth(history, 2)).toBe(2);
    expect(history.replaceState).toHaveBeenCalledTimes(1);
    expect(readStateDepth(history.state)).toBe(2);
    // Next internals are left for Next's patched history to copy (it then syncs its URL)
    expect(history.state).toEqual({ other: 'kept', [DEPTH_KEY]: 2 });

    // Later success retreats with the restored depth
    const onLanded = vi.fn();
    returnToEntry(history, '/submit-venue', onLanded);
    expect(history.go).toHaveBeenCalledWith(-2);
  });

  it.each([
    { name: 'b：depth 是 0', state: { [DEPTH_KEY]: 0 }, draftDepth: 0 },
    { name: 'c：state 與暫存都沒有 depth', state: null, draftDepth: null },
  ])('$name → 直接 replaceState，不呼叫 history.go', ({ state, draftDepth }) => {
    const history = fakeHistory(state);
    restoreDepth(history, draftDepth);
    history.replaceState.mockClear();
    const onLanded = vi.fn();
    returnToEntry(history, '/submit-venue', onLanded);
    expect(history.go).not.toHaveBeenCalled();
    expect(history.replaceState).toHaveBeenCalledWith(
      expect.objectContaining({ [DEPTH_KEY]: 0 }),
      '',
      '/submit-venue'
    );
    expect(onLanded).toHaveBeenCalledTimes(1);
  });

  it('returnToEntry 用 go 退回時，回到那一筆後才 replace 網址', () => {
    const history = fakeHistory({ [DEPTH_KEY]: 2 });
    const onLanded = vi.fn();
    const landing = returnToEntry(history, '/submit-venue?step=1', onLanded);
    expect(history.go).toHaveBeenCalledWith(-2);
    expect(history.replaceState).not.toHaveBeenCalled();

    history.state = { [DEPTH_KEY]: 0 };
    landing?.();
    expect(history.replaceState).toHaveBeenCalledWith(
      expect.objectContaining({ [DEPTH_KEY]: 0 }),
      '',
      '/submit-venue?step=1'
    );
    expect(onLanded).toHaveBeenCalledTimes(1);
  });

  it('e：在 depth 1 push 一筆 → 新的 history.state.depth 是 2', () => {
    const history = fakeHistory({ [DEPTH_KEY]: 1, __NA: true });
    expect(pushStep(history, '/submit-venue?step=3')).toBe(2);
    expect(history.pushState).toHaveBeenCalledWith({ [DEPTH_KEY]: 2 }, '', '/submit-venue?step=3');
  });
});

describe('TC-119 c～e 退回有錯的步驟', () => {
  it('c：depth 2、要退到第 1 步 → go(-2)，不 push', () => {
    const history = fakeHistory({ [DEPTH_KEY]: 2 });
    expect(jumpBackToStep(history, 3, 1, '/submit-venue?step=1')).toBe('go');
    expect(history.go).toHaveBeenCalledWith(-2);
    expect(history.pushState).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'd：history.state 沒有 depth', state: {} },
    { name: 'e：depth 不夠退', state: { [DEPTH_KEY]: 1 } },
  ])('$name → replaceState 換成目標步驟，不呼叫 go、pushState', ({ state }) => {
    const history = fakeHistory(state);
    expect(jumpBackToStep(history, 3, 1, '/submit-venue?step=1')).toBe('replace');
    expect(history.go).not.toHaveBeenCalled();
    expect(history.pushState).not.toHaveBeenCalled();
    expect(history.replaceState).toHaveBeenCalledWith(
      expect.anything(),
      '',
      '/submit-venue?step=1'
    );
  });
});
