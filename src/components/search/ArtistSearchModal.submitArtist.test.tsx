import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ArtistSearchModal from './ArtistSearchModal';

const push = vi.fn();
const sendGAEvent = vi.fn();
const searchResults: Array<Record<string, unknown>> = [];

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/submit-artist',
}));

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: (...args: unknown[]) => sendGAEvent(...args),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: { uid: 'user-1' }, toggleAuthModal: vi.fn() }),
}));

vi.mock('@/hooks/useArtistSearch', () => ({
  useArtistSearch: () => ({ data: searchResults, isLoading: false }),
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}));

vi.mock('@/hooks/useScrollLock', () => ({
  useScrollLock: () => {},
}));

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

const artistA = {
  id: 'a1',
  slug: 'artist-a',
  stageName: 'ALPHA',
  realName: '甲',
  birthday: '2000-01-02',
  coffeeEventCount: 5,
};
const artistB = { id: 'b2', stageName: 'BETA', realName: '乙', birthday: '2001-03-04' };

async function openAndSearch(entryPoint: 'submit_artist_page' | 'header', onClose = vi.fn()) {
  const user = userEvent.setup();
  render(<ArtistSearchModal isOpen={true} onClose={onClose} entryPoint={entryPoint} />);
  await user.type(screen.getByRole('textbox', { name: '搜尋藝人' }), 'x');
  return { user, onClose };
}

beforeEach(() => {
  searchResults.length = 0;
  searchResults.push(artistA, artistB);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('ArtistSearchModal entryPoint=submit_artist_page', () => {
  it('TC-003 結果卡不顯示活動數，且卡片本體沒有可點擊的連結', async () => {
    await openAndSearch('submit_artist_page');

    expect(screen.queryByText(/生日應援$/)).toBeNull();
    expect(screen.queryByText(/目前無任何生日應援/)).toBeNull();
    expect(screen.getByText(/ALPHA/)).toBeTruthy();
    expect(screen.getByText(/BETA/)).toBeTruthy();
    // Only the two CTAs per card are links; no card-wide link remains.
    expect(screen.getAllByRole('link')).toHaveLength(4);
    expect(screen.queryByRole('link', { name: /前往 ALPHA 的生日應援地圖頁面/ })).toBeNull();
  });

  it('TC-003 每張卡有「查看應援」與「新增應援」兩個 CTA', async () => {
    await openAndSearch('submit_artist_page');

    expect(screen.getAllByText('查看應援')).toHaveLength(2);
    expect(screen.getAllByText('新增應援')).toHaveLength(2);
  });

  it('TC-004 / TC-020 點「查看應援」導向地圖頁，送 click_artist ui_source=view_map 並關閉彈窗', async () => {
    const { user, onClose } = await openAndSearch('submit_artist_page');

    await user.click(screen.getByRole('link', { name: '查看 ALPHA 的生日應援' }));

    expect(sendGAEvent).toHaveBeenCalledWith(
      'event',
      'click_artist',
      expect.objectContaining({
        event_page: '/submit-artist',
        content_id: 'a1',
        entry_point: 'submit_artist_page',
        ui_source: 'view_map',
      })
    );
    expect(push).toHaveBeenCalledWith('/map/artist-a');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('TC-005 / TC-021 點「新增應援」導向 /submit-event?artistId，送 ui_source=add_event 並關閉彈窗', async () => {
    const { user, onClose } = await openAndSearch('submit_artist_page');

    await user.click(screen.getByRole('link', { name: '為 BETA 新增生日應援' }));

    expect(sendGAEvent).toHaveBeenCalledWith(
      'event',
      'click_artist',
      expect.objectContaining({
        content_id: 'b2',
        entry_point: 'submit_artist_page',
        ui_source: 'add_event',
      })
    );
    expect(push).toHaveBeenCalledWith('/submit-event?artistId=b2');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('TC-019 開啟時送 search_artist，entry_point=submit_artist_page', () => {
    render(<ArtistSearchModal isOpen={true} onClose={vi.fn()} entryPoint="submit_artist_page" />);

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'search_artist', {
      event_page: '/submit-artist',
      user_id: 'user-1',
      content_id: '',
      entry_point: 'submit_artist_page',
    });
  });

  it('TC-024 兩個 CTA 的 accessible name 都帶藝人名，不同卡可區分', async () => {
    await openAndSearch('submit_artist_page');

    expect(screen.getByRole('link', { name: '查看 ALPHA 的生日應援' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '為 ALPHA 新增生日應援' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '查看 BETA 的生日應援' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '為 BETA 新增生日應援' })).toBeTruthy();
  });

  it('TC-025 / TC-026 Tab 只停在 CTA，順序為查看應援 → 新增應援', async () => {
    const { user } = await openAndSearch('submit_artist_page');
    screen.getByRole('textbox', { name: '搜尋藝人' }).focus();

    await user.tab();
    expect(screen.getByRole('button', { name: '關閉搜尋' })).toBe(document.activeElement);
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('link', { name: '查看 ALPHA 的生日應援' })
    );
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('link', { name: '為 ALPHA 新增生日應援' })
    );
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: '查看 BETA 的生日應援' }));
  });

  it('TC-006 有結果時，底部「找不到，繼續填寫表單」只關閉彈窗、不導航', async () => {
    const { user, onClose } = await openAndSearch('submit_artist_page');

    await user.click(screen.getByRole('button', { name: /找不到，繼續填寫表單/ }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
    expect(screen.queryByText(/點擊前往新增藝人/)).toBeNull();
  });

  it('TC-006 查無結果時，底部 CTA 同樣只關閉彈窗、不導航', async () => {
    searchResults.length = 0;
    const { user, onClose } = await openAndSearch('submit_artist_page');

    expect(screen.getByText('找不到該藝人')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /找不到，繼續填寫表單/ }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('TC-007 右上角 X 關閉彈窗', async () => {
    const { user, onClose } = await openAndSearch('submit_artist_page');

    await user.click(screen.getByRole('button', { name: '關閉搜尋' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('ArtistSearchModal 其他入口不受客製影響 (TC-009)', () => {
  it('header：整卡可點、底部維持原文案、click_artist 不帶 ui_source', async () => {
    const { user } = await openAndSearch('header');

    expect(screen.queryByText('查看應援')).toBeNull();
    expect(screen.queryByText('新增應援')).toBeNull();
    expect(screen.getByText(/點擊前往新增藝人/)).toBeTruthy();
    expect(screen.queryByText(/找不到，繼續填寫表單/)).toBeNull();

    await user.click(screen.getByText(/ALPHA/));
    const clickCall = sendGAEvent.mock.calls.find(([, name]) => name === 'click_artist');
    expect(clickCall?.[2]).toEqual({
      event_page: '/submit-artist',
      user_id: 'user-1',
      content_id: 'a1',
      entry_point: 'header',
    });
  });

  it('先以 submit_artist_page 開啟並關閉，再從 header 開啟：客製狀態不殘留，search_artist 不帶 ui_source', () => {
    const { rerender } = render(
      <ArtistSearchModal isOpen={true} onClose={vi.fn()} entryPoint="submit_artist_page" />
    );
    rerender(
      <ArtistSearchModal isOpen={false} onClose={vi.fn()} entryPoint="submit_artist_page" />
    );
    sendGAEvent.mockClear();
    rerender(<ArtistSearchModal isOpen={true} onClose={vi.fn()} entryPoint="header" />);

    expect(sendGAEvent).toHaveBeenCalledWith('event', 'search_artist', {
      event_page: '/submit-artist',
      user_id: 'user-1',
      content_id: '',
      entry_point: 'header',
    });
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).queryByText('新增應援')).toBeNull();
  });
});
