import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DesktopNav from './DesktopNav';

const sendGAEvent = vi.fn();
const toggleAuthModal = vi.fn();
let mockUser: { uid: string } | null = null;

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: (...args: unknown[]) => sendGAEvent(...args),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/map/wonwoo',
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: mockUser,
    userData: mockUser ? { role: 'user', displayName: 'tester' } : null,
    signOut: vi.fn(),
    toggleAuthModal,
    loading: false,
  }),
}));

describe('DesktopNav 找生咖場地', () => {
  beforeEach(() => {
    sendGAEvent.mockClear();
    toggleAuthModal.mockClear();
  });

  afterEach(cleanup);

  describe.each([
    ['未登入', null, ''],
    ['已登入', { uid: 'u1' }, 'u1'],
  ])('%s', (_label, user, uid) => {
    beforeEach(() => {
      mockUser = user;
    });

    it('連到 /venues 且排在「舉辦生日應援」之前', () => {
      render(<DesktopNav />);
      const venues = screen.getByRole('link', { name: '找生咖場地' });
      const submit = screen.getByRole('link', { name: '舉辦生日應援' });
      expect(venues.getAttribute('href')).toBe('/venues');
      expect(
        venues.compareDocumentPosition(submit) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('點擊送出 nav_venues 且不開登入視窗', async () => {
      render(<DesktopNav />);
      await userEvent.setup().click(screen.getByRole('link', { name: '找生咖場地' }));
      expect(sendGAEvent).toHaveBeenCalledWith('event', 'nav_venues', {
        event_page: '/map/wonwoo',
        user_id: uid,
        content_id: 'desktop_nav',
      });
      expect(toggleAuthModal).not.toHaveBeenCalled();
    });
  });
});
