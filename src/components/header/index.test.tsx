import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Header from './index';

const back = vi.fn();
const push = vi.fn();
let mockPathname = '/';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back, push }),
  usePathname: () => mockPathname,
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    authModalOpen: false,
    toggleAuthModal: vi.fn(),
  }),
}));

// 這幾個子元件本身有各自的重度依賴（AuthModal -> SignInForm -> ...、ShareButton -> ShareContext），
// 跟這裡要驗證的行為（Header 不會因為路徑而整個 unmount、MobileBackButton 狀態不被清空）無關，
// 用簡單 stub 隔離，避免測試因為無關的 provider 缺失而失敗。
vi.mock('./DesktopNav', () => ({
  default: () => <nav aria-label="stub-desktop-nav" />,
}));

vi.mock('./MobileMenu', () => ({
  default: () => null,
}));

vi.mock('../auth/AuthModal', () => ({
  default: () => null,
}));

vi.mock('../ShareButton', () => ({
  default: () => null,
}));

describe('Header', () => {
  beforeEach(() => {
    back.mockClear();
    push.mockClear();
    mockPathname = '/';
  });

  afterEach(cleanup);

  it('地圖頁不再回傳 null,仍會渲染 header', () => {
    mockPathname = '/map/wonwoo';
    render(<Header />);
    expect(document.querySelector('header')).not.toBeNull();
  });

  it('重現回報的完整導覽路徑:首頁 → 活動頁 → 地圖頁 → 另一活動頁,返回鍵應呼叫 back() 而非 fallback 到 push', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Header />);

    mockPathname = '/event/wonwoo-2026-07-BWwLJk';
    rerender(<Header />);

    // 修正前:pathname 進入 /map/* 時 Header 直接 return null 整個 unmount,
    // MobileBackButton 用 useRef 記錄的 inSiteDepth 因此被銷毀歸零。
    mockPathname = '/map/wonwoo';
    rerender(<Header />);

    mockPathname = '/event/wonwoo-2026-07-L17Kz6';
    rerender(<Header />);

    await user.click(screen.getByRole('button', { name: '返回上一頁' }));

    // 修正後:Header 在地圖頁仍保持掛載,inSiteDepth 沒有被清空,
    // 應該呼叫 back() 回到 /map/wonwoo,而不是 fallback push('/')
    expect(back).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('地圖頁時返回鍵仍會渲染(手機寬度下)', () => {
    mockPathname = '/map/wonwoo';
    render(<Header />);
    expect(screen.getByRole('button', { name: '返回上一頁' })).not.toBeNull();
  });
});
