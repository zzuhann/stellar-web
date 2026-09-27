import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEffect, useRef, useState } from 'react';
import ArtistSearchModal from './ArtistSearchModal';
import AuthModal from '../auth/AuthModal';

// jsdom never computes layout so offsetParent is always null, which would make useFocusTrap's focusable-element filter silently find nothing in AuthModal.
let offsetParentDescriptor: PropertyDescriptor | undefined;
beforeAll(() => {
  offsetParentDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get: () => document.body,
  });
});
afterAll(() => {
  if (offsetParentDescriptor) {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', offsetParentDescriptor);
  }
});

const push = vi.fn();
const refetchUserData = vi.fn();
// Wired up by Wrapper's mount effect so ArtistSearchModal and AuthModal share one useAuth() context, matching how toggleAuthModal actually flows between the two real sibling components.
const authValue: {
  user: { uid: string } | null;
  toggleAuthModal: (redirectTo?: string) => void;
  redirectUrl: string | null;
  refetchUserData: typeof refetchUserData;
} = {
  user: null,
  toggleAuthModal: () => {},
  redirectUrl: null,
  refetchUserData,
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/',
}));

vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => authValue,
}));

vi.mock('@/hooks/useArtistSearch', () => ({
  useArtistSearch: () => ({ data: [], isLoading: false }),
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}));

vi.mock('@/hooks/useScrollLock', () => ({
  useScrollLock: () => {},
}));

vi.mock('../ArtistCard/ArtistCardLink', () => ({
  default: () => null,
}));

// SignInForm's real children import @/lib/auth (real Firebase init); stub with one focusable button so useFocusTrap has a real target.
vi.mock('../auth/SignInForm', () => ({
  default: () => <button type="button">stub sign-in</button>,
}));

// Mirrors the real layout: ArtistSearchModal (via GlobalSearchModal) and AuthModal (in Header) are separate siblings sharing one useAuth() context.
function Wrapper() {
  const [searchOpen, setSearchOpen] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  // A real focusable trigger, like HeaderSearchButton's own ref — without one, useFocusTrap falls back to document.body, which jsdom's .focus() can't actually move focus onto.
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    authValue.toggleAuthModal = () => setAuthOpen(true);
  }, []);

  return (
    <>
      <button ref={triggerRef} type="button">
        trigger
      </button>
      <ArtistSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        entryPoint="header"
        triggerRef={triggerRef}
      />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

describe('ArtistSearchModal -> AuthModal focus handoff (未登入點「新增藝人」)', () => {
  beforeEach(() => {
    push.mockClear();
    refetchUserData.mockClear();
    authValue.user = null;
    authValue.redirectUrl = null;
  });

  afterEach(cleanup);

  it('焦點最終落在 AuthModal 內，不被搜尋 modal 的 return-focus 搶回', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    await user.type(screen.getByRole('textbox', { name: '搜尋藝人' }), '查無此人');
    await user.click(screen.getByText(/點擊前往新增藝人/));

    const authDialog = screen.getByRole('dialog', { name: '登入' });
    await waitFor(() => expect(authDialog.contains(document.activeElement)).toBe(true));

    // The bug this guards against is transient (AuthModal grabs focus, then a same-commit rAF from ArtistSearchModal's cleanup steals it back a frame later), so recheck after that frame.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    expect(authDialog.contains(document.activeElement)).toBe(true);
  });
});
