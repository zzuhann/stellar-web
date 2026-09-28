import { describe, it, expect, beforeEach } from 'vitest';
import { createRef } from 'react';
import { useSearchModalStore } from './useSearchModalStore';

// Zustand store is a module-level singleton; reset between tests to avoid pollution.
const resetStore = () =>
  useSearchModalStore.setState({ isOpen: false, entryPoint: null, triggerRef: null });

describe('useSearchModalStore', () => {
  beforeEach(resetStore);

  it('starts closed with no entry point or trigger', () => {
    const state = useSearchModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.entryPoint).toBeNull();
    expect(state.triggerRef).toBeNull();
  });

  it('open() sets isOpen, entryPoint, and triggerRef', () => {
    const ref = createRef<HTMLButtonElement>();
    useSearchModalStore.getState().open('header', ref);

    const state = useSearchModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.entryPoint).toBe('header');
    expect(state.triggerRef).toBe(ref);
  });

  it('open() while already open is a no-op (does not switch entry point/trigger)', () => {
    const headerRef = createRef<HTMLButtonElement>();
    const pillRef = createRef<HTMLButtonElement>();

    useSearchModalStore.getState().open('header', headerRef);
    // Overlay blocks other triggers in practice, but the guard should hold even if bypassed
    useSearchModalStore.getState().open('top_artists', pillRef);

    const state = useSearchModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.entryPoint).toBe('header');
    expect(state.triggerRef).toBe(headerRef);
  });

  it('close() sets isOpen to false but keeps the last entryPoint/triggerRef for focus return', () => {
    const ref = createRef<HTMLButtonElement>();
    useSearchModalStore.getState().open('search_section', ref);
    useSearchModalStore.getState().close();

    const state = useSearchModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.entryPoint).toBe('search_section');
    expect(state.triggerRef).toBe(ref);
  });

  it('can reopen from a different entry point after closing', () => {
    const headerRef = createRef<HTMLButtonElement>();
    const pillRef = createRef<HTMLButtonElement>();

    useSearchModalStore.getState().open('header', headerRef);
    useSearchModalStore.getState().close();
    useSearchModalStore.getState().open('top_artists', pillRef);

    const state = useSearchModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.entryPoint).toBe('top_artists');
    expect(state.triggerRef).toBe(pillRef);
  });
});
