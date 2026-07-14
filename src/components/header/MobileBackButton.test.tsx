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
  });

  afterEach(cleanup);

  it.each(['/', '/admin', '/admin/venues', '/admin-new/review'])(
    '%s 不顯示全域返回鍵',
    (pathname) => {
      render(<MobileBackButton pathname={pathname} />);
      expect(screen.queryByRole('button', { name: '返回上一頁' })).toBeNull();
    }
  );

  it('地圖頁跟其他一般頁面一樣顯示返回鍵', () => {
    render(<MobileBackButton pathname="/map/artist-1" />);
    expect(screen.getByRole('button', { name: '返回上一頁' })).not.toBeNull();
  });

  it('一般非首頁顯示可存取的返回鍵', () => {
    render(<MobileBackButton pathname="/venues" />);
    expect(screen.getByRole('button', { name: '返回上一頁' })).not.toBeNull();
  });

  it('站內導覽後點返回鍵呼叫 back(),不呼叫 push', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<MobileBackButton pathname="/" />);
    rerender(<MobileBackButton pathname="/venues" />);
    rerender(<MobileBackButton pathname="/venues/venue-1" />);

    await user.click(screen.getByRole('button', { name: '返回上一頁' }));

    expect(back).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('沒有站內導覽紀錄(例如直接進入)時點返回鍵 fallback 回首頁', async () => {
    const user = userEvent.setup();
    render(<MobileBackButton pathname="/venues" />);

    await user.click(screen.getByRole('button', { name: '返回上一頁' }));

    expect(push).toHaveBeenCalledWith('/');
    expect(back).not.toHaveBeenCalled();
  });

  it('真實 popstate(使用者按系統返回鍵)發生後,inSiteDepth 正確減少', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<MobileBackButton pathname="/" />);
    // 兩次站內前進導覽,inSiteDepth = 2
    rerender(<MobileBackButton pathname="/venues" />);
    rerender(<MobileBackButton pathname="/venues/venue-1" />);

    // 模擬使用者按了一次真實瀏覽器返回鍵/系統手勢:先觸發 popstate,
    // 接著 pathname 變回上一頁,讓 effect 判斷為 nativeBack 分支,inSiteDepth 減 1 -> 剩 1
    window.dispatchEvent(new PopStateEvent('popstate'));
    rerender(<MobileBackButton pathname="/venues" />);

    // 深度還剩 1,點返回鍵應呼叫 back(),而不是 fallback 到 push('/')
    await user.click(screen.getByRole('button', { name: '返回上一頁' }));

    expect(back).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('inSiteDepth 耗盡後(連續 native back 直到歸零)點返回鍵 fallback 回首頁', async () => {
    const user = userEvent.setup();
    // 從 /venues 掛載(不計入深度),前進一次到 /venues/venue-1,inSiteDepth = 1
    const { rerender } = render(<MobileBackButton pathname="/venues" />);
    rerender(<MobileBackButton pathname="/venues/venue-1" />);

    // 一次真實 popstate,回到 /venues,inSiteDepth 減 1 -> 歸零(夾在 0 下限,不會變負數)
    window.dispatchEvent(new PopStateEvent('popstate'));
    rerender(<MobileBackButton pathname="/venues" />);

    await user.click(screen.getByRole('button', { name: '返回上一頁' }));

    expect(push).toHaveBeenCalledWith('/');
    expect(back).not.toHaveBeenCalled();
  });

  it('app 返回鍵觸發 back() 後緊接收到 popstate,不會污染下一次前進導覽的深度計數', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<MobileBackButton pathname="/" />);
    rerender(<MobileBackButton pathname="/venues" />);
    rerender(<MobileBackButton pathname="/venues/venue-1" />);

    await user.click(screen.getByRole('button', { name: '返回上一頁' }));
    expect(back).toHaveBeenCalledTimes(1);
    back.mockClear();
    push.mockClear();

    // router.back() 本身會觸發真實瀏覽器的 popstate 事件;appBack 分支已把 nativeBack 重置,
    // 這裡再次派發 popstate 模擬瀏覽器行為,驗證它不會被下一次的一般前進導覽誤判成 nativeBack 分支
    window.dispatchEvent(new PopStateEvent('popstate'));
    rerender(<MobileBackButton pathname="/venues" />);

    // 緊接著的一般前進導覽,不應被誤判成 nativeBack 分支處理
    rerender(<MobileBackButton pathname="/venues/venue-2" />);

    await user.click(screen.getByRole('button', { name: '返回上一頁' }));

    // 若 nativeBack.current 殘留為 true,上面的前進導覽會被誤判、深度被扣減,
    // 可能導致這裡因深度不足而 fallback 呼叫 push('/')。正確行為應是深度仍足夠並呼叫 back()。
    expect(back).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });
});
