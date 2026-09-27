import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BirthdayTab from './BirthdayTab';
import { useSearchModalStore } from '@/store/useSearchModalStore';
import useSearchSectionEntry from '../hook/useSearchSectionEntry';

// WeekArtistCard imports @/lib/auth-context, which initializes real Firebase; mock it away like the sibling entry-point tests do so this stays a pure store-wiring test.
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: null }),
}));

const resetStore = () =>
  useSearchModalStore.setState({ isOpen: false, entryPoint: null, triggerRef: null });

// Uses the actual production hook (also used by HomePage/index.tsx) instead of a hand-copied wiring, so this test can't drift from HomePage's real wiring.
function Wrapper() {
  const { searchTriggerRef, onSearchClick } = useSearchSectionEntry();
  return (
    <BirthdayTab
      artists={[]}
      loading={false}
      onSearchClick={onSearchClick}
      searchTriggerRef={searchTriggerRef}
    />
  );
}

describe('BirthdayTab SearchSection entry point', () => {
  beforeEach(resetStore);
  afterEach(cleanup);

  it('opens the shared search modal store with entryPoint=search_section and its own ref (TC-003/009/022)', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    const button = screen.getByRole('button', { name: '搜尋藝人、團體的生日應援' });
    await user.click(button);

    const state = useSearchModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.entryPoint).toBe('search_section');
    expect(state.triggerRef?.current).toBe(button);
  });
});
