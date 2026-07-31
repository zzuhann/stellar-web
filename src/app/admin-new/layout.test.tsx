import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminNewLayout from './layout';
import { useAuth } from '@/lib/auth-context';

afterEach(cleanup);

const push = vi.fn();
const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/components/Loading', () => ({
  default: () => <div role="status">loading</div>,
}));

const mockAuth = vi.mocked(useAuth);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AdminNewLayout', () => {
  it('非登入使用者會被導回首頁，且不會渲染 children', () => {
    mockAuth.mockReturnValue({
      user: null,
      userData: null,
      loading: false,
    } as unknown as ReturnType<typeof useAuth>);

    render(
      <AdminNewLayout>
        <div>admin-only content</div>
      </AdminNewLayout>
    );

    expect(replace).toHaveBeenCalledWith('/');
    expect(screen.queryByText('admin-only content')).toBeNull();
  });

  it('已登入但非 admin 的使用者會被導回首頁，且不會渲染 children', () => {
    mockAuth.mockReturnValue({
      user: { uid: 'u1' },
      userData: { role: 'user' },
      loading: false,
    } as unknown as ReturnType<typeof useAuth>);

    render(
      <AdminNewLayout>
        <div>admin-only content</div>
      </AdminNewLayout>
    );

    expect(replace).toHaveBeenCalledWith('/');
    expect(screen.queryByText('admin-only content')).toBeNull();
  });

  it('權限判斷載入中時顯示 Loading，不渲染 children、不導頁', () => {
    mockAuth.mockReturnValue({
      user: null,
      userData: null,
      loading: true,
    } as unknown as ReturnType<typeof useAuth>);

    render(
      <AdminNewLayout>
        <div>admin-only content</div>
      </AdminNewLayout>
    );

    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByText('admin-only content')).toBeNull();
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('admin 使用者可以正常看到 children，不會被導頁', () => {
    mockAuth.mockReturnValue({
      user: { uid: 'admin-1' },
      userData: { role: 'admin' },
      loading: false,
    } as unknown as ReturnType<typeof useAuth>);

    render(
      <AdminNewLayout>
        <div>admin-only content</div>
      </AdminNewLayout>
    );

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByText('admin-only content')).toBeTruthy();
  });
});
