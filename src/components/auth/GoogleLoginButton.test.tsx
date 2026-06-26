import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GoogleLoginButton from './GoogleLoginButton';
import { signInWithGoogle } from '@/lib/auth';
import showToast from '@/lib/toast';

afterEach(cleanup);

vi.mock('@/lib/auth', () => ({
  signInWithGoogle: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ refetchUserData: vi.fn() }),
}));

describe('GoogleLoginButton', () => {
  it('renders Google Login Button', () => {
    render(<GoogleLoginButton />);
    expect(screen.getByRole('button', { name: '使用 Google 登入' })).toBeTruthy();
  });

  it('disabled after clicking button', async () => {
    render(<GoogleLoginButton />);
    const button = screen.getByRole('button', { name: '使用 Google 登入' });
    vi.mocked(signInWithGoogle).mockImplementation(() => new Promise(() => {}));
    await userEvent.click(button);
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it('calls showToast.success when login return success', async () => {
    render(<GoogleLoginButton />);
    const button = screen.getByRole('button', { name: '使用 Google 登入' });
    vi.mocked(signInWithGoogle).mockResolvedValue({
      user: { uid: 'test-uid' } as any,
      error: null,
    });
    await userEvent.click(button);
    expect(showToast.success).toHaveBeenCalled();
  });

  it('calls props onSuccess when login return success', async () => {
    const onSuccess = vi.fn();
    render(<GoogleLoginButton onSuccess={onSuccess} />);
    const button = screen.getByRole('button', { name: '使用 Google 登入' });
    vi.mocked(signInWithGoogle).mockResolvedValue({
      user: { uid: 'test-uid' } as any,
      error: null,
    });
    await userEvent.click(button);
    expect(onSuccess).toHaveBeenCalled();
  });

  it('calls showToast.error when login returns error', async () => {
    render(<GoogleLoginButton />);
    const button = screen.getByRole('button', { name: '使用 Google 登入' });
    vi.mocked(signInWithGoogle).mockResolvedValue({ user: null, error: 'Google 登入失敗' });
    await userEvent.click(button);
    expect(showToast.error).toHaveBeenCalled();
  });

  it('calls showToast.error on unexpected exception', async () => {
    render(<GoogleLoginButton />);
    const button = screen.getByRole('button', { name: '使用 Google 登入' });
    vi.mocked(signInWithGoogle).mockRejectedValue(new Error('Google 登入失敗'));
    await userEvent.click(button);
    expect(showToast.error).toHaveBeenCalled();
  });
});
