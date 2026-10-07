import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MobileMenu from './MobileMenu';

const sendGAEvent = vi.fn();
const toggleAuthModal = vi.fn();
const closeMobileMenu = vi.fn();
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

describe('MobileMenu 找生咖場地', () => {
  beforeEach(() => {
    sendGAEvent.mockClear();
    toggleAuthModal.mockClear();
    closeMobileMenu.mockClear();
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
      render(<MobileMenu isOpen closeMobileMenu={closeMobileMenu} />);
      const venues = screen.getByRole('link', { name: '找生咖場地' });
      const submit = screen.getByRole('link', { name: '舉辦生日應援' });
      expect(venues.getAttribute('href')).toBe('/venues');
      expect(
        venues.compareDocumentPosition(submit) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('點擊送出 nav_venues、關閉選單且不開登入視窗', async () => {
      render(<MobileMenu isOpen closeMobileMenu={closeMobileMenu} />);
      await userEvent.setup().click(screen.getByRole('link', { name: '找生咖場地' }));
      expect(sendGAEvent).toHaveBeenCalledWith('event', 'nav_venues', {
        event_page: '/map/wonwoo',
        user_id: uid,
        content_id: 'mobile_menu',
      });
      expect(closeMobileMenu).toHaveBeenCalledTimes(1);
      expect(toggleAuthModal).not.toHaveBeenCalled();
    });
  });
});
