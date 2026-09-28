import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './auth-context';

let authStateCallback: ((user: unknown) => void) | null = null;

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, callback: (user: unknown) => void) => {
    authStateCallback = callback;
    return () => {};
  },
}));

vi.mock('./firebase', () => ({ auth: {} }));

vi.mock('./auth', () => ({
  getUserData: vi.fn().mockResolvedValue(null),
  createUserDocument: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));

// Test consumer exposing the auth modal API so we can drive it like a real caller would.
function ModalProbe() {
  const { authModalOpen, openAuthModal, closeAuthModal } = useAuth();
  return (
    <div>
      <span data-testid="modal-state">{authModalOpen ? 'open' : 'closed'}</span>
      <button onClick={() => openAuthModal()}>open</button>
      <button onClick={() => closeAuthModal()}>close</button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  authStateCallback = null;
});

describe('AuthProvider openAuthModal/closeAuthModal', () => {
  it('呼叫 openAuthModal 兩次(模擬 Strict Mode 對同一個 effect 的雙重呼叫)modal 仍是開啟狀態，不會互相抵銷', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <ModalProbe />
      </AuthProvider>
    );
    await act(async () => authStateCallback?.(null));

    const openButton = screen.getByRole('button', { name: 'open' });
    await user.click(openButton);
    await user.click(openButton);

    expect(screen.getByTestId('modal-state').textContent).toBe('open');
  });

  it('closeAuthModal 直接設為關閉狀態，不受呼叫次數影響', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <ModalProbe />
      </AuthProvider>
    );
    await act(async () => authStateCallback?.(null));

    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(screen.getByTestId('modal-state').textContent).toBe('open');

    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(screen.getByTestId('modal-state').textContent).toBe('closed');
  });
});
