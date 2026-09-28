import { renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import useSearchSectionEntry from './useSearchSectionEntry';
import { useSearchModalStore } from '@/store/useSearchModalStore';

const resetStore = () =>
  useSearchModalStore.setState({ isOpen: false, entryPoint: null, triggerRef: null });

describe('useSearchSectionEntry', () => {
  beforeEach(resetStore);

  it('onSearchClick opens the shared store with entryPoint=search_section and its own searchTriggerRef (TC-003/009/022)', () => {
    const { result } = renderHook(() => useSearchSectionEntry());

    result.current.onSearchClick();

    const state = useSearchModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.entryPoint).toBe('search_section');
    expect(state.triggerRef).toBe(result.current.searchTriggerRef);
  });
});
