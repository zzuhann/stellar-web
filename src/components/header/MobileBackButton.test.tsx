import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MobileBackButton from './MobileBackButton';

const back = vi.fn();
const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back, push }),
}));

describe('MobileBackButton', () => {
  beforeEach(() => {
    back.mockClear();
    push.mockClear();
    Object.defineProperty(document, 'referrer', { configurable: true, value: '' });
  });

  afterEach(cleanup);

  it.each(['/', '/map/artist-1', '/admin', '/admin/venues', '/admin-new/review'])(
    '%s 不顯示全域返回鍵',
    (pathname) => {
      render(<MobileBackButton pathname={pathname} />);
      expect(screen.queryByRole('button', { name: '返回上一頁' })).toBeNull();
    }
  );

  it('一般非首頁顯示可存取的返回鍵', () => {
    render(<MobileBackButton pathname="/venues" />);
    expect(screen.getByRole('button', { name: '返回上一頁' })).not.toBeNull();
  });

  it('站內導覽後回到上一頁', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<MobileBackButton pathname="/" />);
    rerender(<MobileBackButton pathname="/venues" />);
    rerender(<MobileBackButton pathname="/venues/venue-1" />);

    await user.click(screen.getByRole('button', { name: '返回上一頁' }));

    expect(back).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('app 返回鍵觸發 back() 後緊接收到 popstate,不會污染下一次前進導覽的 stack', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<MobileBackButton pathname="/" />);
    rerender(<MobileBackButton pathname="/venues" />);
    rerender(<MobileBackButton pathname="/venues/venue-1" />);

    await user.click(screen.getByRole('button', { name: '返回上一頁' }));
    expect(back).toHaveBeenCalledTimes(1);
    back.mockClear();
    push.mockClear();

    // router.back() 本身會觸發真實瀏覽器的 popstate 事件
    window.dispatchEvent(new PopStateEvent('popstate'));
    rerender(<MobileBackButton pathname="/venues" />);

    // 緊接著的一般前進導覽,不應被誤判成 nativeBack 分支處理
    rerender(<MobileBackButton pathname="/venues/venue-2" />);

    await user.click(screen.getByRole('button', { name: '返回上一頁' }));

    // 若 nativeBack.current 殘留為 true,上面的前進導覽會被誤判、stack 遭清空,
    // 導致這裡因 stack 為空而 fallback 呼叫 push('/')。正確行為應是 stack 仍有紀錄並呼叫 back()。
    expect(back).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('直接進入或由外站進入時回首頁', async () => {
    const user = userEvent.setup();
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'https://www.google.com/search?q=%E5%8F%B0%E7%81%A3%E5%9C%B0%E5%9C%96',
    });
    render(<MobileBackButton pathname="/venues" />);

    await user.click(screen.getByRole('button', { name: '返回上一頁' }));

    expect(push).toHaveBeenCalledWith('/');
    expect(back).not.toHaveBeenCalled();
  });

  it('沒有站內路徑紀錄時不依賴同網域 referrer', async () => {
    const user = userEvent.setup();
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: `${window.location.origin}/venues`,
    });
    render(<MobileBackButton pathname="/venues/venue-1" />);

    await user.click(screen.getByRole('button', { name: '返回上一頁' }));

    expect(push).toHaveBeenCalledWith('/');
    expect(back).not.toHaveBeenCalled();
  });
});
