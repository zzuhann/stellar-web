import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import HeaderSearchButton from './HeaderSearchButton';
import { useSearchModalStore } from '@/store/useSearchModalStore';

const resetStore = () =>
  useSearchModalStore.setState({ isOpen: false, entryPoint: null, triggerRef: null });

describe('HeaderSearchButton', () => {
  beforeEach(resetStore);
  afterEach(cleanup);

  it('opens the shared search modal store with entryPoint=header and its own ref (TC-001/007/020)', async () => {
    const user = userEvent.setup();
    render(<HeaderSearchButton />);

    const button = screen.getByRole('button', { name: '搜尋藝人' });
    await user.click(button);

    const state = useSearchModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.entryPoint).toBe('header');
    expect(state.triggerRef?.current).toBe(button);
  });
});
